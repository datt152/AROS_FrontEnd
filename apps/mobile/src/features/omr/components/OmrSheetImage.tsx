import type { OmrAnswerItem } from '@aros/shared/features/omr/types/omr.types'
import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import { SHEET_ASPECT_RATIO } from '../lib/sheetGeometry'

type NaturalSize = { width: number; height: number }

type OverlayDot = {
  key: string
  question: number
  choice: string
  x: number
  y: number
  w: number
  h: number
  tone: string
}

/** Giống web OmrWarpedImageOverlay: gom bubble từ overlayBubbles, tone green = đúng, còn lại = sai */
function collectOverlays(answers: OmrAnswerItem[]): OverlayDot[] {
  const dots: OverlayDot[] = []
  for (const answer of answers) {
    for (const bubble of answer.overlayBubbles ?? []) {
      if (bubble.w <= 0 || bubble.h <= 0) continue
      let tone = bubble.tone || (answer.isCorrect === true ? 'green' : 'red')
      if (tone === 'yellow') tone = answer.isCorrect === true ? 'green' : 'red'
      dots.push({
        key: `${answer.question}-${bubble.choice}-${bubble.x}-${bubble.y}-${tone}`,
        question: answer.question,
        choice: bubble.choice,
        x: bubble.x,
        y: bubble.y,
        w: bubble.w,
        h: bubble.h,
        tone,
      })
    }
  }
  return dots
}

type OmrSheetImageProps = {
  uri: string
  headers?: Record<string, string>
  answers: OmrAnswerItem[]
  highlightedQuestion?: number | null
  onSelectQuestion?: (question: number) => void
  onPressImage?: () => void
}

/**
 * Ảnh phiếu đã warp kèm overlay vòng tròn đúng (xanh) / sai (đỏ) theo tọa độ backend trả.
 * Tọa độ bubble tính theo pixel ảnh gốc → đổi sang % để khớp mọi kích thước hiển thị.
 */
export function OmrSheetImage({
  uri,
  headers,
  answers,
  highlightedQuestion = null,
  onSelectQuestion,
  onPressImage,
}: OmrSheetImageProps) {
  const [natural, setNatural] = useState<NaturalSize | null>(null)
  const overlays = collectOverlays(answers)
  const aspect = natural ? natural.width / natural.height : SHEET_ASPECT_RATIO

  return (
    <View>
      <View style={[styles.frame, { aspectRatio: aspect }]}>
        <Image
          source={{ uri, headers }}
          style={StyleSheet.absoluteFill}
          resizeMode="stretch"
          onLoad={(event) => {
            const { width, height } = event.nativeEvent.source
            if (width > 0 && height > 0) setNatural({ width, height })
          }}
        />
        {onPressImage ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onPressImage} />
        ) : null}

        {natural
          ? overlays.map((bubble) => {
              const active = highlightedQuestion === bubble.question
              const padScale = active ? 1.5 : 1.25
              const widthPct = (bubble.w / natural.width) * 100 * padScale
              const heightPct = (bubble.h / natural.height) * 100 * padScale
              const centerXPct = ((bubble.x + bubble.w / 2) / natural.width) * 100
              const centerYPct = ((bubble.y + bubble.h / 2) / natural.height) * 100
              const isGreen = bubble.tone === 'green'
              return (
                <Pressable
                  key={bubble.key}
                  onPress={() => onSelectQuestion?.(bubble.question)}
                  style={[
                    styles.dot,
                    {
                      left: `${centerXPct - widthPct / 2}%`,
                      top: `${centerYPct - heightPct / 2}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                      borderColor: isGreen ? '#10B981' : '#EF4444',
                      backgroundColor: isGreen
                        ? 'rgba(16,185,129,0.35)'
                        : 'rgba(239,68,68,0.35)',
                    },
                    active && styles.dotActive,
                  ]}
                />
              )
            })
          : null}
      </View>

      {natural && overlays.length === 0 ? (
        <Text style={styles.noOverlayText}>Không có tọa độ bubble để overlay.</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 999,
    minWidth: 12,
    minHeight: 12,
  },
  dotActive: {
    borderWidth: 3,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 3,
  },
  noOverlayText: {
    marginTop: 8,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
})
