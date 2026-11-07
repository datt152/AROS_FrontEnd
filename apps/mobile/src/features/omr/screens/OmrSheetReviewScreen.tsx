import { Ionicons } from '@expo/vector-icons'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import { getAccessToken } from '@aros/shared/api/apiClient'
import {
  formatOmrDateTime,
  formatOmrScore,
  getOmrSheetMatchIssues,
  omrAnswerListLabel,
  resolveOmrSheetImageUrl,
  type OmrSheetReviewPayload,
} from '@aros/shared/features/omr/types/omr.types'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { API_ORIGIN } from '@/platform/apiClient'
import { colors } from '@/theme/colors'

import { SheetStatusBadge } from '../components/OmrBadges'
import { OmrSheetImage } from '../components/OmrSheetImage'
import { useOmrSheet, useOmrSheets, useReviewOmrSheet } from '../hooks/useOmr'

const CHOICES = ['A', 'B', 'C', 'D'] as const

function toMobileImageUrl(raw: string | null): string | null {
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) return `${API_ORIGIN}${raw}`
  return raw
}

export function OmrSheetReviewScreen({ sheetId }: { sheetId: number }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const sheetQuery = useOmrSheet(sheetId)
  const sheet = sheetQuery.data

  const reviewMutation = useReviewOmrSheet(sheetId, sheet?.examSessionId)
  const sessionSheetsQuery = useOmrSheets(sheet?.examSessionId)

  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [imageZoom, setImageZoom] = useState(false)
  const [highlightedQuestion, setHighlightedQuestion] = useState<number | null>(null)

  useEffect(() => {
    if (!sheet) return
    const next: Record<number, string> = {}
    sheet.answers.forEach((answer) => {
      if (answer.chosen) next[answer.question] = answer.chosen
    })
    setDraftAnswers(next)
    setSaveError(null)
    setSavedNote(null)
  }, [sheet?.submissionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const imageUrl = useMemo(() => {
    if (!sheet) return null
    return toMobileImageUrl(resolveOmrSheetImageUrl(sheet))
  }, [sheet])

  const imageHeaders = useMemo(() => {
    const token = getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }, [sheetId])

  const matchIssues = sheet ? getOmrSheetMatchIssues(sheet) : null

  const nextReviewSheet = useMemo(() => {
    const sheets = sessionSheetsQuery.data ?? []
    return (
      sheets.find(
        (item) =>
          item.submissionId !== sheetId &&
          (item.status === 'NEEDS_REVIEW' ||
            item.status === 'RETAKE_REQUIRED' ||
            item.status === 'FAILED'),
      ) ?? null
    )
  }, [sessionSheetsQuery.data, sheetId])

  const changedCount = useMemo(() => {
    if (!sheet) return 0
    let count = 0
    for (const answer of sheet.answers) {
      const draft = draftAnswers[answer.question]
      if ((draft ?? null) !== (answer.chosen ?? null)) count++
    }
    return count
  }, [sheet, draftAnswers])

  function setAnswerChoice(question: number, choice: string) {
    setDraftAnswers((prev) => ({ ...prev, [question]: choice }))
    setHighlightedQuestion(question)
    setSavedNote(null)
  }

  async function handleSaveReview() {
    if (!sheet) return
    if (!sheet.examCode) {
      setSaveError('Phiếu chưa có mã đề — không thể lưu kết quả. Cần chụp lại hoặc đợi nhận dạng mã đề.')
      return
    }

    const answers: OmrSheetReviewPayload['answers'] = {}
    for (const [question, choice] of Object.entries(draftAnswers)) {
      if (CHOICES.includes(choice as (typeof CHOICES)[number])) {
        answers[question] = choice as (typeof CHOICES)[number]
      }
    }

    if (Object.keys(answers).length === 0) {
      setSaveError('Chọn ít nhất một đáp án trước khi lưu kết quả.')
      return
    }

    setSaveError(null)
    try {
      const updated = await reviewMutation.mutateAsync({ answers })
      setSavedNote(
        updated.status === 'GRADED'
          ? 'Đã lưu kết quả. Phiếu đã được chấm lại.'
          : 'Đã lưu kết quả. Phiếu vẫn cần kiểm tra thêm.',
      )
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Không lưu được kết quả'))
    }
  }

  if (sheetQuery.isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ReviewHeader title="Phiếu OMR" onBack={() => router.back()} />
        <View style={styles.fullCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (sheetQuery.isError || !sheet) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ReviewHeader title="Phiếu OMR" onBack={() => router.back()} />
        <View style={styles.fullCenter}>
          <Text style={styles.emptyTitle}>Không tải được phiếu OMR</Text>
          <Text style={styles.emptyDesc}>
            {getApiErrorMessage(sheetQuery.error, 'Phiếu không tồn tại.')}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={() => void sheetQuery.refetch()}
          >
            <Text style={styles.actionBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ReviewHeader
        title={`Phiếu #${sheet.submissionId}`}
        subtitle={`Điểm ${formatOmrScore(sheet.score, sheet.maxScore)}${
          sheet.gradedAt ? ` · ${formatOmrDateTime(sheet.gradedAt)}` : ''
        }`}
        badge={<SheetStatusBadge status={sheet.status} />}
        onBack={() => router.back()}
      />

      <FlatList
        data={sheet.answers}
        keyExtractor={(item) => String(item.question)}
        contentContainerStyle={[styles.listContent, { paddingBottom: 140 + insets.bottom }]}
        ListHeaderComponent={
          <>
            {/* Ảnh phiếu */}
            <View style={styles.imageCard}>
              <View style={styles.imageCardHeader}>
                <Text style={styles.cardTitle}>Ảnh phiếu</Text>
                {imageUrl ? (
                  <Pressable onPress={() => setImageZoom(true)} hitSlop={8}>
                    <Text style={styles.zoomLink}>Phóng to</Text>
                  </Pressable>
                ) : null}
              </View>
              {imageUrl ? (
                <OmrSheetImage
                  uri={imageUrl}
                  headers={imageHeaders}
                  answers={sheet.answers}
                  highlightedQuestion={highlightedQuestion}
                  onSelectQuestion={setHighlightedQuestion}
                  onPressImage={() => setImageZoom(true)}
                />
              ) : (
                <View style={styles.noImage}>
                  <Ionicons name="image-outline" size={36} color={colors.textSubtle} />
                  <Text style={styles.noImageText}>Chưa có URL ảnh xem được</Text>
                </View>
              )}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.3)' }]} />
                  <Text style={styles.legendText}>Đúng</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.25)' }]} />
                  <Text style={styles.legendText}>Sai / tô trùng</Text>
                </View>
              </View>
            </View>

            {/* Nhận dạng */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Thông tin nhận dạng</Text>
              <View style={styles.infoGrid}>
                <View style={[styles.infoBox, matchIssues?.studentUnmatched && styles.infoBoxWarn]}>
                  <Text style={styles.infoLabel}>MSSV</Text>
                  <Text style={styles.infoValue}>{sheet.studentId ?? '—'}</Text>
                </View>
                <View style={[styles.infoBox, matchIssues?.studentUnmatched && styles.infoBoxWarn]}>
                  <Text style={styles.infoLabel}>Họ tên</Text>
                  <Text style={styles.infoValue}>
                    {sheet.studentName ?? (matchIssues?.studentUnmatched ? 'Chưa khớp SV' : '—')}
                  </Text>
                </View>
                <View style={[styles.infoBox, matchIssues?.examCodeMissing && styles.infoBoxWarn]}>
                  <Text style={styles.infoLabel}>Mã đề</Text>
                  <Text style={styles.infoValue}>
                    {sheet.examCode ?? (matchIssues?.examCodeMissing ? 'Chưa có' : '—')}
                  </Text>
                </View>
              </View>
              {matchIssues?.label ? (
                <View style={styles.warnBox}>
                  <Ionicons name="warning-outline" size={16} color="#B45309" />
                  <View style={styles.warnTextWrap}>
                    <Text style={styles.warnTitle}>{matchIssues.label}</Text>
                    {matchIssues.studentUnmatched ? (
                      <Text style={styles.warnDesc}>
                        {sheet.studentId
                          ? `SBD đọc được "${sheet.studentId}" không khớp sinh viên nào trong lớp.`
                          : 'Không đọc được SBD trên phiếu.'}
                      </Text>
                    ) : null}
                    {matchIssues.examCodeMissing ? (
                      <Text style={styles.warnDesc}>
                        Không nhận dạng được mã đề hợp lệ — chưa thể lưu kết quả cho phiếu này.
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>

            <Text style={styles.answersTitle}>
              Đáp án nhận dạng{changedCount > 0 ? ` · đã sửa ${changedCount} câu` : ''}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>Chưa có đáp án.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const label = omrAnswerListLabel(item)
          const chosen = draftAnswers[item.question] ?? item.chosen
          const highlighted = highlightedQuestion === item.question
          return (
            <View style={[styles.answerRow, highlighted && styles.answerRowHighlight]}>
              <Pressable style={styles.answerTop} onPress={() => setHighlightedQuestion(item.question)}>
                <Text style={styles.answerQuestion}>Câu {item.question}</Text>
                <Text
                  style={[
                    styles.answerLabel,
                    label === 'Đúng'
                      ? styles.labelOk
                      : label === 'Tô trùng'
                        ? styles.labelWarn
                        : styles.labelBad,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
              <View style={styles.choiceRow}>
                {CHOICES.map((choice) => {
                  const selected = chosen === choice
                  const isCorrectAnswer = item.correctAnswer === choice
                  return (
                    <Pressable
                      key={choice}
                      style={[
                        styles.choiceBtn,
                        selected && styles.choiceBtnSelected,
                        !selected && isCorrectAnswer && item.isCorrect === false && styles.choiceBtnCorrect,
                      ]}
                      onPress={() => setAnswerChoice(item.question, choice)}
                    >
                      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                        {choice}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          )
        }}
        ListFooterComponent={<View style={{ height: 8 }} />}
      />

      {/* Sticky save bar */}
      <View style={[styles.saveBar, { paddingBottom: insets.bottom + 14 }]}>
        {saveError ? (
          <Text style={styles.saveError} numberOfLines={2}>
            {saveError}
          </Text>
        ) : savedNote ? (
          <Text style={styles.saveOk} numberOfLines={2}>
            {savedNote}
          </Text>
        ) : null}

        <View style={styles.saveRow}>
          {nextReviewSheet ? (
            <Pressable
              style={({ pressed }) => [styles.nextBtn, pressed && styles.btnPressed]}
              onPress={() =>
                router.replace({
                  pathname: '/teacher/sheet',
                  params: { sheetId: String(nextReviewSheet.submissionId) },
                })
              }
            >
              <Text style={styles.nextBtnText}>Phiếu cần xem lại tiếp</Text>
              <Ionicons name="arrow-forward" size={17} color={colors.primary} />
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.btnPressed,
              (reviewMutation.isPending || sheet.answers.length === 0) && styles.saveBtnDisabled,
            ]}
            onPress={() => void handleSaveReview()}
            disabled={reviewMutation.isPending || sheet.answers.length === 0}
          >
            {reviewMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={19} color="#fff" />
                <Text style={styles.saveBtnText}>Lưu kết quả</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Zoom modal */}
      <Modal visible={imageZoom} transparent animationType="fade" onRequestClose={() => setImageZoom(false)}>
        <View style={styles.zoomBackdrop}>
          <Pressable style={styles.zoomClose} onPress={() => setImageZoom(false)} hitSlop={10}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
          {imageUrl ? (
            <View style={styles.zoomImageWrap}>
              <OmrSheetImage
                uri={imageUrl}
                headers={imageHeaders}
                answers={sheet.answers}
                highlightedQuestion={highlightedQuestion}
                onSelectQuestion={setHighlightedQuestion}
              />
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function ReviewHeader({
  title,
  subtitle,
  badge,
  onBack,
}: {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  onBack: () => void
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <View style={styles.headerText}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {badge}
        </View>
        {subtitle ? (
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 130,
  },
  imageCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  zoomLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 36,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  noImageText: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
  },
  legendText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  infoCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoGrid: {
    gap: 8,
  },
  infoBox: {
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 1,
  },
  infoBoxWarn: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  warnBox: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    padding: 11,
  },
  warnTextWrap: {
    flex: 1,
    gap: 2,
  },
  warnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  warnDesc: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  answersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  answerRow: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  answerRowHighlight: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  answerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelOk: {
    color: '#059669',
  },
  labelWarn: {
    color: '#B45309',
  },
  labelBad: {
    color: colors.danger,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceBtn: {
    width: 42,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceBtnCorrect: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  choiceTextSelected: {
    color: '#fff',
  },
  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: 'rgba(248,250,252,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  saveError: {
    fontSize: 12,
    color: colors.danger,
  },
  saveOk: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  saveRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  saveBtnDisabled: {
    opacity: 0.55,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  btnPressed: {
    opacity: 0.85,
  },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  actionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnPressed: {
    backgroundColor: '#F8FAFC',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  zoomBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 1,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomImageWrap: {
    width: '92%',
  },
})
