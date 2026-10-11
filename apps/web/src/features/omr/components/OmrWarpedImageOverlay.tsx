import { useState } from 'react'

import type { OmrAnswerItem } from '@aros/shared/features/omr/types/omr.types'

type OmrWarpedImageOverlayProps = {
  src: string
  alt: string
  answers: OmrAnswerItem[]
  highlightedQuestion?: number | null
  onSelectQuestion?: (question: number) => void
}

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

function bubbleToneClass(tone: string) {
  if (tone === 'green') {
    return 'border-emerald-500 bg-emerald-400/35 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]'
  }
  return 'border-red-500 bg-red-400/35 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
}

function collectOverlays(answers: OmrAnswerItem[]): OverlayDot[] {
  const dots: OverlayDot[] = []
  for (const answer of answers) {
    for (const bubble of answer.overlayBubbles ?? []) {
      if (bubble.w <= 0 || bubble.h <= 0) continue
      let tone = bubble.tone || (answer.isCorrect === true ? 'green' : 'red')
      if (tone === 'yellow') {
        tone = answer.isCorrect === true ? 'green' : 'red'
      }
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

export function OmrWarpedImageOverlay({
  src,
  alt,
  answers,
  highlightedQuestion = null,
  onSelectQuestion,
}: OmrWarpedImageOverlayProps) {
  const [natural, setNatural] = useState<NaturalSize | null>(null)
  const overlays = collectOverlays(answers)

  return (
    <div className="relative mx-auto w-max max-w-full">
      <img
        src={src}
        alt={alt}
        className="block h-auto max-h-[70vh] max-w-full rounded-xl bg-slate-100"
        onLoad={(event) => {
          const img = event.currentTarget
          setNatural({ width: img.naturalWidth, height: img.naturalHeight })
        }}
      />

      {natural && natural.width > 0 && natural.height > 0
        ? overlays.map((bubble) => {
            const active = highlightedQuestion === bubble.question
            const padScale = active ? 1.45 : 1.25
            const leftPct = (bubble.x / natural.width) * 100
            const topPct = (bubble.y / natural.height) * 100
            const widthPct = (bubble.w / natural.width) * 100
            const heightPct = (bubble.h / natural.height) * 100

            return (
              <button
                key={bubble.key}
                type="button"
                title={`Câu ${bubble.question}: ${bubble.choice}`}
                aria-label={`Câu ${bubble.question}, ${bubble.choice}`}
                onClick={() => onSelectQuestion?.(bubble.question)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${bubbleToneClass(bubble.tone)} ${
                  active ? 'z-20 ring-2 ring-blue-500 ring-offset-1' : ''
                }`}
                style={{
                  left: `${leftPct + widthPct / 2}%`,
                  top: `${topPct + heightPct / 2}%`,
                  width: `${widthPct * padScale}%`,
                  height: `${heightPct * padScale}%`,
                  minWidth: 14,
                  minHeight: 14,
                }}
              />
            )
          })
        : null}

      {natural && overlays.length === 0 ? (
        <p className="mt-2 text-center text-xs text-slate-500">Không có tọa độ bubble để overlay.</p>
      ) : null}
    </div>
  )
}
