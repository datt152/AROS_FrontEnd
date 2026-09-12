import { ArrowLeft, Check, ImageOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
import { omrSessionPath, ROUTES } from '../../../routes/routes.config'
import { getMockSheet } from '../lib/omr.mock'
import type { OmrAnswerItem, OmrSheetItem } from '../types/omr.types'
import {
  formatOmrDateTime,
  formatOmrScore,
  OMR_SHEET_STATUS_BADGE,
  OMR_SHEET_STATUS_LABEL,
} from '../types/omr.types'

const CHOICES = ['A', 'B', 'C', 'D'] as const

export function OmrSheetReviewPage() {
  const { sheetId: sheetIdParam } = useParams()
  const sheetId = Number(sheetIdParam)
  const base = getMockSheet(sheetId)

  const [sheet, setSheet] = useState<OmrSheetItem | null>(() => (base ? { ...base, answers: [...base.answers] } : null))
  const [studentIdDraft, setStudentIdDraft] = useState(base?.studentId ?? '')
  const [examCodeDraft, setExamCodeDraft] = useState(base?.examCode ?? '')
  const [savedNote, setSavedNote] = useState<string | null>(null)

  const needSet = useMemo(() => new Set(sheet?.needReview ?? []), [sheet?.needReview])

  function setAnswerChoice(question: number, choice: string) {
    setSheet((prev) => {
      if (!prev) return prev
      const answers = prev.answers.map((item) => {
        if (item.question !== question) return item
        const isCorrect =
          item.correctAnswer != null ? choice === item.correctAnswer : null
        return {
          ...item,
          chosen: choice,
          isCorrect,
          status: 'OK',
          bubble: item.bubble ? { ...item.bubble, choice } : { choice, x: 0, y: 0, w: 18, h: 18 },
        }
      })
      return {
        ...prev,
        answers,
        needReview: prev.needReview.filter((q) => q !== question),
      }
    })
  }

  function handleSaveReview() {
    if (!sheet) return
    const remaining = sheet.answers.filter(
      (a) => needSet.has(a.question) || a.chosen == null,
    ).length
    const nextStatus =
      remaining === 0 && studentIdDraft.trim() && examCodeDraft.trim()
        ? 'GRADED'
        : 'NEEDS_REVIEW'

    let score: number | null = sheet.score
    if (nextStatus === 'GRADED') {
      const graded = sheet.answers.filter((a) => a.isCorrect != null)
      const correct = graded.filter((a) => a.isCorrect).length
      score = graded.length
        ? Math.round((correct / graded.length) * (sheet.maxScore ?? 10) * 10) / 10
        : 0
    }

    setSheet({
      ...sheet,
      studentId: studentIdDraft.trim() || null,
      examCode: examCodeDraft.trim() || null,
      status: nextStatus,
      score,
      gradedAt: nextStatus === 'GRADED' ? new Date().toISOString() : sheet.gradedAt,
      needReview: sheet.answers.filter((a) => a.chosen == null).map((a) => a.question),
    })
    setSavedNote(
      nextStatus === 'GRADED'
        ? 'Đã xác nhận review (mock). Phiếu chuyển sang Đã chấm.'
        : 'Đã lưu chỉnh sửa (mock). Vẫn còn câu cần xem lại.',
    )
  }

  if (!Number.isFinite(sheetId) || !sheet) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.teacher.omrUpload}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại
        </Link>
        <EmptyState title="Không tìm thấy phiếu" description="Phiếu OMR không tồn tại trong dữ liệu mock." />
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
          {sheet.originalImageUrl || sheet.warpedUrl ? (
            <img
              src={sheet.originalImageUrl ?? sheet.warpedUrl ?? undefined}
              alt={`OMR sheet ${sheet.submissionId}`}
              className="max-h-[70vh] w-full rounded-xl object-contain bg-slate-100"
            />
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-500">
              <ImageOff className="h-8 w-8" strokeWidth={1.5} />
              <p className="text-sm">Chưa có ảnh (mock — BE sẽ trả warpedUrl)</p>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-800">Thông tin nhận dạng</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm text-slate-600">MSSV</span>
                <Input
                  value={studentIdDraft}
                  onChange={(e) => setStudentIdDraft(e.target.value)}
                  placeholder="21520001"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm text-slate-600">Mã đề</span>
                <Input
                  value={examCodeDraft}
                  onChange={(e) => setExamCodeDraft(e.target.value)}
                  placeholder="001"
                />
              </label>
            </div>
            {sheet.needReview.length > 0 ? (
              <p className="mt-3 text-xs text-amber-700">
                Cần xem lại câu: {sheet.needReview.join(', ')}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-800">Đáp án nhận dạng</p>
            {sheet.answers.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có đáp án (đang xử lý hoặc lỗi).</p>
            ) : (
              <ul className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
                {sheet.answers.map((answer) => (
                  <AnswerRow
                    key={answer.question}
                    answer={answer}
                    highlight={needSet.has(answer.question)}
                    onPick={(choice) => setAnswerChoice(answer.question, choice)}
                  />
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-col gap-2">
            <Button onClick={handleSaveReview}>
              <Check className="h-4 w-4" strokeWidth={1.75} />
              Lưu review
            </Button>
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
  onPick,
}: {
  answer: OmrAnswerItem
  highlight: boolean
  onPick: (choice: string) => void
}) {
  return (
    <li
      className={`rounded-xl border px-3 py-2 ${
        highlight ? 'border-orange-200 bg-orange-50/70' : 'border-slate-100 bg-slate-50/80'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">Câu {answer.question}</span>
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
