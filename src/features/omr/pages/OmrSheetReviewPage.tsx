import { AlertTriangle, ArrowLeft, Check, ImageOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { omrSessionPath, ROUTES } from '../../../routes/routes.config'
import { OmrWarpedImageOverlay } from '../components/OmrWarpedImageOverlay'
import { OMR_ANSWER_LEVEL_BADGE, OMR_SHEET_STATUS_BADGE } from '../components/omrStyles'
import { useOmrSheet, useReviewOmrSheet } from '../hooks/useOmr'
import type { OmrAnswerItem, OmrAnswerLevel, OmrSheetReviewPayload } from '../types/omr.types'
import {
  formatOmrDateTime,
  formatOmrScore,
  getOmrSheetMatchIssues,
  omrAnswerListLabel,
  OMR_ANSWER_LEVEL_LABEL,
  OMR_SHEET_STATUS_LABEL,
  resolveOmrSheetImageUrl,
} from '../types/omr.types'

const CHOICES = ['A', 'B', 'C', 'D'] as const

const LEGEND_LEVELS: OmrAnswerLevel[] = ['ok', 'error']

const LEGEND_DOT_CLASS: Record<OmrAnswerLevel, string> = {
  ok: 'border-emerald-500 bg-emerald-400/35',
  warning: 'border-amber-500 bg-amber-400/35',
  error: 'border-red-500 bg-red-400/30',
  empty: 'border-slate-400 bg-slate-300/30',
}

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
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null)
  /** Snapshot nhận dạng từ BE — không đổi khi sửa draft / sau lưu review */
  const [overlaySnapshot, setOverlaySnapshot] = useState<OmrAnswerItem[]>([])

  useEffect(() => {
    if (!sheet) return
    setOverlaySnapshot(
      sheet.answers.map((answer) => ({
        ...answer,
        bubble: answer.bubble ? { ...answer.bubble } : null,
        overlayBubbles: answer.overlayBubbles.map((bubble) => ({ ...bubble })),
        markedBubbles: answer.markedBubbles.map((bubble) => ({ ...bubble })),
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

  const overlayFocusQuestion = hoveredQuestion ?? highlightedQuestion
  const imageUrl = sheet ? resolveOmrSheetImageUrl(sheet) : null
  const matchIssues = sheet ? getOmrSheetMatchIssues(sheet) : null

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
          {matchIssues?.label ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
              {matchIssues.label}
            </span>
          ) : null}
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
            <>
              <OmrWarpedImageOverlay
                src={imageUrl}
                alt={`OMR sheet ${sheet.submissionId}`}
                answers={overlaySnapshot}
                highlightedQuestion={overlayFocusQuestion}
                onSelectQuestion={setHighlightedQuestion}
              />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
                {LEGEND_LEVELS.map((level) => (
                  <span key={level} className="inline-flex items-center gap-1.5">
                    <span className={`h-3 w-3 rounded-full border-2 ${LEGEND_DOT_CLASS[level]}`} />
                    {OMR_ANSWER_LEVEL_LABEL[level]}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-500">
              <ImageOff className="h-8 w-8" strokeWidth={1.5} />
              <p className="text-sm">Chưa có URL ảnh xem được</p>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-800">Thông tin nhận dạng</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div
                className={`rounded-xl px-3 py-2 ${
                  matchIssues?.studentUnmatched ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-slate-50'
                }`}
              >
                <dt className="text-xs text-slate-400">MSSV</dt>
                <dd className="font-medium text-slate-800">{sheet.studentId ?? '—'}</dd>
              </div>
              <div
                className={`rounded-xl px-3 py-2 ${
                  matchIssues?.studentUnmatched ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-slate-50'
                }`}
              >
                <dt className="text-xs text-slate-400">Họ tên</dt>
                <dd className="font-medium text-slate-800">
                  {sheet.studentName ?? (matchIssues?.studentUnmatched ? 'Chưa khớp sinh viên' : '—')}
                </dd>
              </div>
              <div
                className={`rounded-xl px-3 py-2 sm:col-span-2 ${
                  matchIssues?.examCodeMissing ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-slate-50'
                }`}
              >
                <dt className="text-xs text-slate-400">Mã đề</dt>
                <dd className="font-medium text-slate-800">
                  {sheet.examCode ?? (matchIssues?.examCodeMissing ? 'Chưa có mã đề' : '—')}
                </dd>
              </div>
            </dl>
            {matchIssues?.label ? (
              <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                <div className="space-y-0.5">
                  <p className="font-medium">{matchIssues.label}</p>
                  {matchIssues.studentUnmatched ? (
                    <p>
                      {sheet.studentId
                        ? `SBD đọc được "${sheet.studentId}" không khớp sinh viên nào trong lớp.`
                        : 'Không đọc được SBD trên phiếu.'}
                    </p>
                  ) : null}
                  {matchIssues.examCodeMissing ? (
                    <p>Không nhận dạng được mã đề hợp lệ — chưa thể lưu kết quả cho phiếu này.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-800">Đáp án nhận dạng</p>
            {displayAnswers.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có đáp án.</p>
            ) : (
              <ul className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
                {displayAnswers.map((answer) => (
                  <AnswerRow
                    key={answer.question}
                    answer={answer}
                    highlight={
                      hoveredQuestion === answer.question || highlightedQuestion === answer.question
                    }
                    onFocusQuestion={() => setHighlightedQuestion(answer.question)}
                    onHoverQuestion={() => setHoveredQuestion(answer.question)}
                    onLeaveQuestion={() => setHoveredQuestion(null)}
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
              {reviewMutation.isPending ? 'Đang lưu...' : 'Lưu kết quả'}
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
  onHoverQuestion,
  onLeaveQuestion,
  onPick,
}: {
  answer: OmrAnswerItem
  highlight: boolean
  onFocusQuestion: () => void
  onHoverQuestion: () => void
  onLeaveQuestion: () => void
  onPick: (choice: string) => void
}) {
  const listLabel = omrAnswerListLabel(answer)
  const greenChoices = new Set(
    (answer.overlayBubbles ?? [])
      .filter((b) => (b.tone ?? '').toLowerCase() === 'green')
      .map((b) => b.choice.toUpperCase()),
  )
  const redChoices = new Set(
    (answer.overlayBubbles ?? [])
      .filter((b) => (b.tone ?? '').toLowerCase() === 'red')
      .map((b) => b.choice.toUpperCase()),
  )
  const letterChosen =
    answer.chosen && CHOICES.includes(answer.chosen.toUpperCase() as (typeof CHOICES)[number])
      ? answer.chosen.toUpperCase()
      : null

  return (
    <li
      className={`rounded-xl border px-3 py-2 transition ${
        highlight
          ? 'border-blue-300 bg-blue-50/70'
          : 'border-slate-200 bg-white'
      }`}
      onMouseEnter={onHoverQuestion}
      onMouseLeave={onLeaveQuestion}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onFocusQuestion}
          className="text-sm font-medium text-slate-800 hover:text-blue-700"
        >
          Câu {answer.question}
        </button>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {listLabel === 'Đúng' ? (
            <span className="text-xs font-medium text-emerald-700">Đúng</span>
          ) : listLabel === 'Tô trùng' ? (
            <span
              className={`inline-flex rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${OMR_ANSWER_LEVEL_BADGE.error}`}
            >
              Tô trùng
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">Sai</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CHOICES.map((choice) => {
          let selected = false
          let scannedWrong = false
          if (listLabel === 'Tô trùng') {
            selected = false
            scannedWrong =
              !!answer.correctAnswer && answer.correctAnswer.toUpperCase() === choice
          } else if (greenChoices.has(choice) || listLabel === 'Đúng' && letterChosen === choice) {
            selected = true
          } else if (redChoices.size === 1 && redChoices.has(choice)) {
            scannedWrong = true
          } else if (letterChosen === choice) {
            selected = true
          }

          return (
            <button
              key={choice}
              type="button"
              onClick={() => {
                onFocusQuestion()
                onPick(choice)
              }}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                selected
                  ? 'bg-blue-600 text-white'
                  : scannedWrong
                    ? 'border border-red-300 bg-red-50 text-red-700'
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
