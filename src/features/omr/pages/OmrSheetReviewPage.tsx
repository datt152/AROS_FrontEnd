import { ArrowLeft, Check, ImageOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { omrSessionPath, ROUTES } from '../../../routes/routes.config'
import { OmrWarpedImageOverlay } from '../components/OmrWarpedImageOverlay'
import { useOmrSheet, useReviewOmrSheet } from '../hooks/useOmr'
import type { OmrAnswerItem, OmrSheetReviewPayload } from '../types/omr.types'
import {
  formatOmrDateTime,
  formatOmrScore,
  OMR_SHEET_STATUS_BADGE,
  OMR_SHEET_STATUS_LABEL,
  resolveOmrSheetImageUrl,
} from '../types/omr.types'

const CHOICES = ['A', 'B', 'C', 'D'] as const

export function OmrSheetReviewPage() {
  const { sheetId: sheetIdParam } = useParams()
  const sheetId = Number(sheetIdParam)
  const validSheetId = Number.isFinite(sheetId) && sheetId > 0 ? sheetId : undefined

  const sheetQuery = useOmrSheet(validSheetId)
  const sheet = sheetQuery.data
  const reviewMutation = useReviewOmrSheet(validSheetId, sheet?.examSessionId)

  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [highlightedQuestion, setHighlightedQuestion] = useState<number | null>(null)
  /** Snapshot nhận dạng từ BE — không đổi khi sửa draft / sau lưu review */
  const [overlaySnapshot, setOverlaySnapshot] = useState<OmrAnswerItem[]>([])

  useEffect(() => {
    if (!sheet) return
    setOverlaySnapshot(
      sheet.answers.map((answer) => ({
        ...answer,
        bubble: answer.bubble ? { ...answer.bubble } : null,
      })),
    )
  }, [sheet?.submissionId])

  useEffect(() => {
    if (!sheet) return
    const next: Record<number, string> = {}
    sheet.answers.forEach((answer) => {
      if (answer.chosen) next[answer.question] = answer.chosen
    })
    setDraftAnswers(next)
  }, [sheet])

  const needSet = useMemo(() => new Set(sheet?.needReview ?? []), [sheet?.needReview])
  const imageUrl = sheet ? resolveOmrSheetImageUrl(sheet) : null

  const displayAnswers = useMemo(() => {
    if (!sheet) return []
    return sheet.answers.map((answer) => ({
      ...answer,
      chosen: draftAnswers[answer.question] ?? answer.chosen,
    }))
  }, [sheet, draftAnswers])

  function setAnswerChoice(question: number, choice: string) {
    setDraftAnswers((prev) => ({ ...prev, [question]: choice }))
    setHighlightedQuestion(question)
    setSavedNote(null)
  }

  async function handleSaveReview() {
    if (!sheet) return
    if (!sheet.examCode) {
      setSaveError('Phiếu chưa có mã đề — không thể review. Cần chụp lại hoặc đợi nhận dạng mã đề.')
      return
    }

    const answers: OmrSheetReviewPayload['answers'] = {}
    for (const [question, choice] of Object.entries(draftAnswers)) {
      if (CHOICES.includes(choice as (typeof CHOICES)[number])) {
        answers[question] = choice as (typeof CHOICES)[number]
      }
    }

    if (Object.keys(answers).length === 0) {
      setSaveError('Chọn ít nhất một đáp án trước khi lưu review.')
      return
    }

    setSaveError(null)
    try {
      const updated = await reviewMutation.mutateAsync({ answers })
      setSavedNote(
        updated.status === 'GRADED'
          ? 'Đã lưu review. Phiếu đã được chấm lại.'
          : 'Đã lưu review. Phiếu vẫn cần kiểm tra thêm.',
      )
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Không lưu được review'))
    }
  }

  if (!validSheetId) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.teacher.omrUpload}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại
        </Link>
        <EmptyState title="Không tìm thấy phiếu" description="Mã phiếu không hợp lệ." />
      </div>
    )
  }

  if (sheetQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (sheetQuery.isError || !sheet) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.teacher.omrUpload}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại
        </Link>
        <ErrorState
          title="Không tải được phiếu OMR"
          message={getApiErrorMessage(sheetQuery.error, 'Phiếu không tồn tại.')}
          action={
            <Button variant="secondary" onClick={() => void sheetQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          to={omrSessionPath(sheet.examSessionId)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Danh sách phiếu
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Phiếu #{sheet.submissionId}
          </h1>
          <span
            className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${OMR_SHEET_STATUS_BADGE[sheet.status]}`}
          >
            {OMR_SHEET_STATUS_LABEL[sheet.status]}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Điểm {formatOmrScore(sheet.score, sheet.maxScore)}
          {sheet.gradedAt ? ` · ${formatOmrDateTime(sheet.gradedAt)}` : ''}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-800">Ảnh phiếu</p>
          {imageUrl ? (
            <OmrWarpedImageOverlay
              src={imageUrl}
              alt={`OMR sheet ${sheet.submissionId}`}
              answers={overlaySnapshot}
              highlightedQuestion={highlightedQuestion}
              onSelectQuestion={setHighlightedQuestion}
            />
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-500">
              <ImageOff className="h-8 w-8" strokeWidth={1.5} />
              <p className="text-sm">Chưa có URL ảnh xem được (warpedUrl)</p>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-800">Thông tin nhận dạng</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-400">MSSV</dt>
                <dd className="font-medium text-slate-800">{sheet.studentId ?? '—'}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-400">Họ tên</dt>
                <dd className="font-medium text-slate-800">{sheet.studentName ?? '—'}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2 sm:col-span-2">
                <dt className="text-xs text-slate-400">Mã đề</dt>
                <dd className="font-medium text-slate-800">{sheet.examCode ?? '—'}</dd>
              </div>
            </dl>
            {!sheet.examCode ? (
              <p className="mt-3 text-xs text-amber-700">
                Thiếu mã đề — API review yêu cầu phiếu đã có examCode.
              </p>
            ) : null}
            {sheet.needReview.length > 0 ? (
              <p className="mt-3 text-xs text-amber-700">
                Cần xem lại câu: {sheet.needReview.join(', ')}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-800">Đáp án nhận dạng</p>
            {displayAnswers.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có đáp án (đang xử lý hoặc lỗi).</p>
            ) : (
              <ul className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
                {displayAnswers.map((answer) => (
                  <AnswerRow
                    key={answer.question}
                    answer={answer}
                    highlight={needSet.has(answer.question) || highlightedQuestion === answer.question}
                    onFocusQuestion={() => setHighlightedQuestion(answer.question)}
                    onPick={(choice) => setAnswerChoice(answer.question, choice)}
                  />
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => void handleSaveReview()}
              disabled={reviewMutation.isPending || displayAnswers.length === 0}
            >
              <Check className="h-4 w-4" strokeWidth={1.75} />
              {reviewMutation.isPending ? 'Đang lưu...' : 'Lưu review'}
            </Button>
            {saveError ? <p className="text-xs text-red-600">{saveError}</p> : null}
            {savedNote ? <p className="text-xs text-slate-600">{savedNote}</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnswerRow({
  answer,
  highlight,
  onFocusQuestion,
  onPick,
}: {
  answer: OmrAnswerItem
  highlight: boolean
  onFocusQuestion: () => void
  onPick: (choice: string) => void
}) {
  return (
    <li
      className={`rounded-xl border px-3 py-2 ${
        highlight ? 'border-blue-300 bg-blue-50/70' : 'border-slate-100 bg-slate-50/80'
      }`}
      onMouseEnter={onFocusQuestion}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onFocusQuestion}
          className="text-sm font-medium text-slate-800 hover:text-blue-700"
        >
          Câu {answer.question}
        </button>
        <span className="text-xs text-slate-500">
          {answer.isCorrect == null
            ? answer.status
            : answer.isCorrect
              ? 'Đúng'
              : `Sai (đáp án ${answer.correctAnswer})`}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CHOICES.map((choice) => {
          const selected = answer.chosen === choice
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onPick(choice)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                selected
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </li>
  )
}
