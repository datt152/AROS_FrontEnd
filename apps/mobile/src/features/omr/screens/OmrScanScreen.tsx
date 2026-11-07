import { Ionicons } from '@expo/vector-icons'
import { parseOmrApiError, type ResolvedOmrError } from '@aros/shared/features/omr/lib/omrErrors'
import { OMR_SHEET_STATUS_LABEL, type OmrSheetItem } from '@aros/shared/features/omr/types/omr.types'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Haptics from 'expo-haptics'
import * as ImageManipulator from 'expo-image-manipulator'
import { useKeepAwake } from 'expo-keep-awake'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/theme/colors'

import { useUploadOmrSheet } from '../hooks/useOmr'
import {
  CROP_MARGIN_RATIO,
  MARKER_SIZE_RATIO,
  SHEET_ASPECT_RATIO,
  SHEET_MARKERS,
  UPLOAD_IMAGE_WIDTH,
} from '../lib/sheetGeometry'

// ─── Upload queue ────────────────────────────────────────────

type QueueItemStatus = 'preparing' | 'uploading' | 'done' | 'error'

type FrameRect = { x: number; y: number; width: number; height: number }

type QueueItem = {
  id: string
  uri: string
  status: QueueItemStatus
  progress: number
  error?: ResolvedOmrError
  sheet?: OmrSheetItem
  /** Khung ngắm lúc chụp (tọa độ màn hình) + kích thước preview — để crop sát phiếu trước khi gửi */
  frame?: FrameRect
  previewWidth?: number
  previewHeight?: number
}

/**
 * Map khung ngắm trên preview (cover) sang vùng pixel của ảnh chụp.
 * Preview hiển thị ảnh theo kiểu cover: scale = max(pw/vw, ph/vh), phần thừa bị cắt 2 bên.
 */
function mapFrameToPhotoCrop(
  frame: FrameRect,
  previewWidth: number,
  previewHeight: number,
  photoWidth: number,
  photoHeight: number,
): FrameRect {
  const scale = Math.max(previewWidth / photoWidth, previewHeight / photoHeight)
  const offsetX = (previewWidth - photoWidth * scale) / 2
  const offsetY = (previewHeight - photoHeight * scale) / 2

  const rawX = (frame.x - offsetX) / scale
  const rawY = (frame.y - offsetY) / scale
  const rawW = frame.width / scale
  const rawH = frame.height / scale

  const marginX = rawW * CROP_MARGIN_RATIO
  const marginY = rawH * CROP_MARGIN_RATIO

  const x = Math.max(0, Math.floor(rawX - marginX))
  const y = Math.max(0, Math.floor(rawY - marginY))
  const right = Math.min(photoWidth, Math.ceil(rawX + rawW + marginX))
  const bottom = Math.min(photoHeight, Math.ceil(rawY + rawH + marginY))

  return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) }
}

function makeQueueId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Screen ──────────────────────────────────────────────────

export function OmrScanScreen({ sessionId }: { sessionId: number }) {
  useKeepAwake()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width: winW, height: winH } = useWindowDimensions()
  const [permission, requestPermission] = useCameraPermissions()

  const cameraRef = useRef<CameraView>(null)
  const processingRef = useRef(false)
  const queueRef = useRef<QueueItem[]>([])

  const [torch, setTorch] = useState(false)
  const [zoom, setZoom] = useState(0)
  const [capturing, setCapturing] = useState(false)
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])

  queueRef.current = queue

  const uploadMutation = useUploadOmrSheet(sessionId)

  const doneCount = queue.filter((item) => item.status === 'done').length
  const errorCount = queue.filter((item) => item.status === 'error').length
  const busyCount = queue.filter(
    (item) => item.status === 'preparing' || item.status === 'uploading',
  ).length

  // ── Guide frame geometry (khung phiếu A4 + 4 khung ngắm marker)
  // Lấy 88% chiều ngang → chiều cao theo tỉ lệ A4 dọc.
  // Căn GIỮA trong khoảng trống giữa header và thanh chụp để ảnh chụp ra phiếu nằm giữa.
  const frameW = winW * 0.88
  const frameH = frameW / SHEET_ASPECT_RATIO
  const frameLeft = (winW - frameW) / 2
  const topReserved = insets.top + 72       // header + sub text
  const bottomReserved = insets.bottom + 170 // bottom controls area
  const availableH = winH - topReserved - bottomReserved
  const frameTop = topReserved + Math.max(0, (availableH - frameH) / 2)
  const markerBox = Math.max(34, frameW * MARKER_SIZE_RATIO * 2.4)
  const markerInner = frameW * MARKER_SIZE_RATIO

  // ── Queue processing ──────────────────────────────────────

  function patchItem(id: string, patch: Partial<QueueItem>) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  async function processQueue() {
    if (processingRef.current) return
    processingRef.current = true

    for (;;) {
      const next = queueRef.current.find(
        (item) => item.status === 'preparing' || item.status === 'uploading',
      )
      if (!next || next.status === 'uploading') break

      patchItem(next.id, { status: 'uploading', progress: 0, error: undefined })
      try {
        // ── Bước 1: Chuẩn hóa EXIF (bake rotation) — KHÔNG nén (compress: 1)
        //    để lấy đúng kích thước pixel sau xoay, tránh mất màu do re-encode.
        const normalized = await ImageManipulator.manipulateAsync(next.uri, [], {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
        })

        // ── Bước 2: Gộp crop + resize vào MỘT lần manipulateAsync duy nhất.
        //    Chỉ encode JPEG 1 lần (compress 0.92) → giữ màu chính xác.
        const actions: ImageManipulator.Action[] = []
        let widthAfterCrop = normalized.width

        if (next.frame && next.previewWidth && next.previewHeight) {
          const crop = mapFrameToPhotoCrop(
            next.frame,
            next.previewWidth,
            next.previewHeight,
            normalized.width,
            normalized.height,
          )
          actions.push({
            crop: { originX: crop.x, originY: crop.y, width: crop.width, height: crop.height },
          })
          widthAfterCrop = crop.width
        }

        if (widthAfterCrop > UPLOAD_IMAGE_WIDTH) {
          actions.push({ resize: { width: UPLOAD_IMAGE_WIDTH } })
        }

        const prepared = await ImageManipulator.manipulateAsync(
          normalized.uri,
          actions,
          { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG },
        )
        const sheet = await uploadMutation.mutateAsync({
          file: {
            uri: prepared.uri,
            name: `omr-${next.id}.jpg`,
            type: 'image/jpeg',
          },
          onUploadProgress: (percent) => patchItem(next.id, { progress: percent }),
        })
        patchItem(next.id, { status: 'done', progress: 100, sheet })
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch (error) {
        patchItem(next.id, {
          status: 'error',
          progress: 0,
          error: parseOmrApiError(error, 'Ảnh phiếu'),
        })
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    }

    processingRef.current = false
  }

  function enqueue(uri: string) {
    const item: QueueItem = {
      id: makeQueueId(),
      uri,
      status: 'preparing',
      progress: 0,
      frame: { x: frameLeft, y: frameTop, width: frameW, height: frameH },
      previewWidth: winW,
      previewHeight: winH,
    }
    setQueue((prev) => [item, ...prev].slice(0, 30))
    // queueRef sẽ được cập nhật qua render; hẹn xử lý ở tick kế tiếp
    setTimeout(() => void processQueue(), 0)
  }

  function retryItem(item: QueueItem) {
    patchItem(item.id, { status: 'preparing', progress: 0, error: undefined })
    setTimeout(() => void processQueue(), 0)
  }

  function removeItem(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  // ── Capture ───────────────────────────────────────────────

  async function handleCapture() {
    if (!cameraRef.current || capturing || previewUri) return
    setCapturing(true)
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 })
      if (photo?.uri) setPreviewUri(photo.uri)
    } catch {
      // lỗi chụp — giữ nguyên màn camera để thử lại
    } finally {
      setCapturing(false)
    }
  }

  function handleUsePhoto() {
    if (!previewUri) return
    enqueue(previewUri)
    setPreviewUri(null)
  }

  // ── Permission states ─────────────────────────────────────

  if (!permission) {
    return (
      <View style={styles.darkCenter}>
        <ActivityIndicator color="#fff" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={[styles.darkCenter, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Ionicons name="camera-outline" size={56} color="#94A3B8" />
        <Text style={styles.permTitle}>Cần quyền camera</Text>
        <Text style={styles.permDesc}>
          AROS cần dùng camera để quét phiếu trả lời OMR của học sinh.
        </Text>
        <Pressable style={styles.permBtn} onPress={() => void requestPermission()}>
          <Text style={styles.permBtnText}>Cho phép camera</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.permBack}>Quay lại</Text>
        </Pressable>
      </View>
    )
  }

  // ── Main camera UI ────────────────────────────────────────

  return (
    <View style={styles.screen}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          zoom={zoom}
          autofocus="on"
        />
      )}

      {/* Dim + guide frame (chỉ hiện khi đang ngắm) */}
      {!previewUri ? (
        <>
          <View style={[styles.dim, { left: 0, right: 0, top: 0, height: frameTop }]} />
          <View
            style={[styles.dim, { left: 0, right: 0, top: frameTop + frameH, bottom: 0 }]}
          />
          <View
            style={[
              styles.dim,
              { left: 0, top: frameTop, width: frameLeft, height: frameH },
            ]}
          />
          <View
            style={[
              styles.dim,
              {
                right: 0,
                top: frameTop,
                width: frameLeft,
                height: frameH,
              },
            ]}
          />

          {/* Paper frame */}
          <View
            pointerEvents="none"
            style={[
              styles.paperFrame,
              { left: frameLeft, top: frameTop, width: frameW, height: frameH },
            ]}
          >
            {SHEET_MARKERS.map((marker, index) => (
              <View
                key={index}
                style={[
                  styles.markerTarget,
                  {
                    left: marker.x * frameW - markerBox / 2,
                    top: marker.y * frameH - markerBox / 2,
                    width: markerBox,
                    height: markerBox,
                  },
                ]}
              >
                <View
                  style={[
                    styles.markerInner,
                    { width: markerInner, height: markerInner },
                  ]}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quét phiếu OMR</Text>
          <Text style={styles.headerSub}>
            {previewUri
              ? 'Kiểm tra ảnh trước khi gửi'
              : 'Đưa 4 ô đen ở 4 góc phiếu vào 4 khung ngắm'}
          </Text>
        </View>
        <View style={styles.counterBadge}>
          <Ionicons name="checkmark-circle" size={15} color="#4ADE80" />
          <Text style={styles.counterText}>{doneCount}</Text>
        </View>
      </View>

      {/* Queue status strip */}
      {queue.length > 0 && !previewUri ? (
        <View style={[styles.queueStrip, { bottom: insets.bottom + 176 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.queueRow}>
              {busyCount > 0 ? (
                <View style={styles.queueChip}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.queueChipText}>Đang gửi {busyCount}…</Text>
                </View>
              ) : null}
              {queue.slice(0, 6).map((item) => (
                <QueueChip
                  key={item.id}
                  item={item}
                  onRetry={() => retryItem(item)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </View>
          </ScrollView>
          {queue.some((item) => item.status === 'error' && item.error) ? (
            <Text style={styles.queueErrorHint} numberOfLines={2}>
              {queue.find((item) => item.status === 'error')?.error?.description}
              {' — bấm vào phiếu lỗi để gửi lại.'}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Zoom controls — phóng gần để phiếu chiếm nhiều điểm ảnh hơn, nét hơn */}
      {!previewUri ? (
        <View style={styles.zoomBar}>
          <Pressable
            style={styles.zoomBtn}
            onPress={() => setZoom((value) => Math.max(0, Math.round((value - 0.05) * 100) / 100))}
            accessibilityLabel="Thu nhỏ"
          >
            <Ionicons name="remove" size={18} color="#fff" />
          </Pressable>
          <Text style={styles.zoomText}>{(1 + zoom * 2).toFixed(1)}x</Text>
          <Pressable
            style={styles.zoomBtn}
            onPress={() => setZoom((value) => Math.min(0.5, Math.round((value + 0.05) * 100) / 100))}
            accessibilityLabel="Phóng to"
          >
            <Ionicons name="add" size={18} color="#fff" />
          </Pressable>
          {zoom > 0 ? (
            <Pressable style={styles.zoomBtn} onPress={() => setZoom(0)} accessibilityLabel="Đặt lại zoom">
              <Ionicons name="refresh-outline" size={16} color="#fff" />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {previewUri ? (
          <View style={styles.previewActions}>
            <Pressable
              style={({ pressed }) => [styles.previewBtn, styles.previewBtnGhost, pressed && styles.btnPressed]}
              onPress={() => setPreviewUri(null)}
            >
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.previewBtnText}>Chụp lại</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.previewBtn, styles.previewBtnPrimary, pressed && styles.btnPressed]}
              onPress={handleUsePhoto}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.previewBtnText}>Dùng ảnh này</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.hintText}>
              Điền kín phiếu vào khung — ảnh sẽ tự cắt sát phiếu khi gửi. Dùng +/− bên phải để
              phóng gần cho nét hơn
            </Text>
            <View style={styles.controlsRow}>
              <Pressable
                style={[styles.sideBtn, torch && styles.sideBtnActive]}
                onPress={() => setTorch((value) => !value)}
                accessibilityLabel={torch ? 'Tắt đèn' : 'Bật đèn'}
              >
                <Ionicons
                  name={torch ? 'flash' : 'flash-outline'}
                  size={22}
                  color={torch ? '#FACC15' : '#fff'}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed]}
                onPress={() => void handleCapture()}
                disabled={capturing}
                accessibilityLabel="Chụp phiếu"
              >
                {capturing ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>

              <Pressable
                style={[styles.sideBtn, errorCount > 0 && styles.sideBtnError]}
                onPress={() => router.back()}
                accessibilityLabel="Xong, quay lại phiên chấm"
              >
                <Ionicons name="checkmark-done" size={22} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.doneHint}>
              Đã gửi {doneCount} phiếu{errorCount > 0 ? ` · ${errorCount} lỗi` : ''} — bấm ✓ khi
              quét xong
            </Text>
          </>
        )}
      </View>
    </View>
  )
}

// ─── Queue chip ──────────────────────────────────────────────

function QueueChip({
  item,
  onRetry,
  onRemove,
}: {
  item: QueueItem
  onRetry: () => void
  onRemove: () => void
}) {
  if (item.status === 'preparing' || item.status === 'uploading') {
    return (
      <View style={styles.queueChip}>
        <Image source={{ uri: item.uri }} style={styles.queueThumb} />
        <Text style={styles.queueChipText}>{item.progress}%</Text>
      </View>
    )
  }

  if (item.status === 'error') {
    return (
      <Pressable style={[styles.queueChip, styles.queueChipError]} onPress={onRetry} onLongPress={onRemove}>
        <Image source={{ uri: item.uri }} style={styles.queueThumb} />
        <Ionicons name="alert-circle" size={14} color="#DC2626" />
        <Text style={[styles.queueChipText, { color: '#DC2626' }]}>Lỗi · Gửi lại</Text>
      </Pressable>
    )
  }

  const sheet = item.sheet
  return (
    <View style={[styles.queueChip, styles.queueChipDone]}>
      <Image source={{ uri: item.uri }} style={styles.queueThumb} />
      <Ionicons name="checkmark-circle" size={14} color="#059669" />
      <Text style={[styles.queueChipText, { color: '#065F46' }]} numberOfLines={1}>
        {sheet?.studentId ?? 'Phiếu'}
        {sheet ? ` · ${OMR_SHEET_STATUS_LABEL[sheet.status]}` : ''}
      </Text>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  darkCenter: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  permTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
  },
  permDesc: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
  },
  permBtn: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  permBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  permBack: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },

  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(2,6,23,0.55)',
  },
  paperFrame: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 4,
  },
  markerTarget: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#4ADE80',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74,222,128,0.10)',
  },
  markerInner: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
  },

  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    gap: 2,
    paddingTop: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  queueStrip: {
    position: 'absolute',
    left: 12,
    right: 12,
    gap: 6,
  },
  queueRow: {
    flexDirection: 'row',
    gap: 8,
  },
  queueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  queueChipDone: {
    backgroundColor: '#ECFDF5',
  },
  queueChipError: {
    backgroundColor: '#FEF2F2',
  },
  queueThumb: {
    width: 22,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  queueChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    maxWidth: 170,
  },
  queueErrorHint: {
    fontSize: 11,
    color: '#FCA5A5',
    paddingHorizontal: 4,
  },

  zoomBar: {
    position: 'absolute',
    right: 12,
    top: '42%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 7,
    borderRadius: 22,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  zoomBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    backgroundColor: 'rgba(2,6,23,0.45)',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  sideBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnActive: {
    backgroundColor: 'rgba(250,204,21,0.22)',
  },
  sideBtnError: {
    backgroundColor: 'rgba(220,38,38,0.35)',
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: {
    transform: [{ scale: 0.94 }],
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
  },
  doneHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
  },
  previewBtnGhost: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  previewBtnPrimary: {
    backgroundColor: colors.primary,
  },
  previewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  btnPressed: {
    opacity: 0.85,
  },
})
