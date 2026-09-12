import { useState } from 'react'

import type { OmrAnswerItem } from '../types/omr.types'

type OmrWarpedImageOverlayProps = {
  src: string
  alt: string
  answers: OmrAnswerItem[]
  highlightedQuestion?: number | null
  onSelectQuestion?: (question: number) => void
}

type NaturalSize = { width: number; height: number }

/** Màu overlay theo isCorrect từ BE (không theo draft sửa bên phải). */
function bubbleToneClass(answer: OmrAnswerItem) {
  if (answer.isCorrect === true) {
    return 'border-emerald-500 bg-emerald-400/35 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]'
  }
  if (answer.isCorrect === false) {
    return 'border-red-500 bg-red-400/35 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]'
  }
  return 'border-amber-500 bg-amber-400/35 shadow-[0_0_0_1px_rgba(245,158,11,0.5)]'
}

export function OmrWarpedImageOverlay({
  src,
  alt,
  answers,
  highlightedQuestion = null,
  onSelectQuestion,
}: OmrWarpedImageOverlayProps) {
  const [natural, setNatural] = useState<NaturalSize | null>(null)

  const overlays = answers.filter(
    (answer): answer is OmrAnswerItem & { bubble: NonNullable<OmrAnswerItem['bubble']> } =>
      Boolean(answer.bubble && answer.bubble.w > 0 && answer.bubble.h > 0),
  )

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
        ? overlays.map((answer) => {
            const { bubble } = answer
            const active = highlightedQuestion === answer.question
            const padScale = active ? 1.45 : 1.25

            const leftPct = (bubble.x / natural.width) * 100
            const topPct = (bubble.y / natural.height) * 100
            const widthPct = (bubble.w / natural.width) * 100
            const heightPct = (bubble.h / natural.height) * 100

            return (
              <button
                key={`${answer.question}-${bubble.choice}-${bubble.x}-${bubble.y}`}
                type="button"
                title={`Câu ${answer.question}: ${bubble.choice}`}
                aria-label={`Câu ${answer.question}, nhận dạng ${bubble.choice}`}
                onClick={() => onSelectQuestion?.(answer.question)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${bubbleToneClass(answer)} ${
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
