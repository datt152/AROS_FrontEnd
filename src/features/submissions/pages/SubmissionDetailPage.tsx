import { useMemo, useState } from 'react'
import { ArrowLeft, Play } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { ROUTES } from '../../../routes/routes.config'
import { StudentSubmissionQuestionItem } from '../components/StudentSubmissionQuestionItem'
import { useMySubmissionDetail, useResolvedSubmissionPurpose } from '../hooks/useSubmissions'
import {
  PURPOSE_BADGE,
  PURPOSE_LABEL,
  SUBMISSION_STATUS_BADGE,
  SUBMISSION_STATUS_LABEL,
  canResumeSubmission,
  formatSubmissionDateTime,
  formatSubmissionScore,
  type StudentSubmissionDetailItem,
} from '../types/submission.types'

function parseSubmissionId(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function QuestionNav({
  items,
  currentIndex,
  onSelect,
}: {
  items: StudentSubmissionDetailItem[]
  currentIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-slate-50/80 lg:w-56">
      <div className="shrink-0 border-b border-slate-200 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Câu hỏi</p>
        <p className="mt-0.5 text-sm text-slate-700">{items.length} câu</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const isCurrent = index === currentIndex
            const tone =
              item.isCorrect === true
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : item.isCorrect === false
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-slate-200 bg-white text-slate-700'
            return (
              <button
                key={item.questionId}
                type="button"
                onClick={() => onSelect(index)}
                className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                  isCurrent ? 'bg-blue-600 text-white shadow-sm' : `${tone} hover:border-slate-300`
                }`}
                aria-label={`Câu ${item.order}`}
              >
                {item.order}
              </button>
            )
          })}
        </div>
        <ul className="mt-4 space-y-1.5 text-[11px] text-slate-500">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-600" /> Đang xem
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-emerald-200 bg-emerald-50" /> Đúng
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-red-200 bg-red-50" /> Sai
          </li>
        </ul>
      </div>
    </aside>
  )
}

export function SubmissionDetailPage() {
  const navigate = useNavigate()
  const { submissionId: submissionIdParam } = useParams<{ submissionId: string }>()
  const submissionId = parseSubmissionId(submissionIdParam)
  const [currentIndex, setCurrentIndex] = useState(0)

  const detailQuery = useMySubmissionDetail(submissionId)
  const detail = detailQuery.data
  const purpose = useResolvedSubmissionPurpose(submissionId, detail?.purpose)
  const isPractice = purpose === 'PRACTICE'

  const sortedDetails = useMemo(() => {
    if (!detail) return []
    return detail.details.slice().sort((a, b) => a.order - b.order)
  }, [detail])

  const currentItem = sortedDetails[currentIndex]

  function handleResume() {
    if (!detail?.classroomId) return
    const state = { examId: detail.examId, classroomId: detail.classroomId }
    const path = isPractice ? ROUTES.student.takePractice : ROUTES.student.takeExam
    void navigate(path, { state })
  }

  if (submissionId === undefined) {
    return (
      <section className="mx-auto max-w-2xl py-8">
        <EmptyState
          title="Không tìm thấy bài nộp"
          description="Liên kết không hợp lệ."
          action={
            <Link to={ROUTES.student.history}>
              <Button variant="secondary">Về lịch sử</Button>
            </Link>
          }
        />
      </section>
    )
  }

  if (detailQuery.isLoading) {
    return (
      <section className="mx-auto max-w-2xl py-10">
        <Spinner label="Đang tải chi tiết..." />
      </section>
    )
  }

  if (detailQuery.isError) {
    const message = getApiErrorMessage(detailQuery.error, 'Không tìm thấy bài nộp')
    return (
      <section className="mx-auto max-w-2xl space-y-4 py-8">
        <ErrorState
          message={message}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void detailQuery.refetch()}>
                Thử lại
              </Button>
              <Link to={ROUTES.student.history}>
                <Button variant="secondary">Về lịch sử</Button>
              </Link>
            </div>
          }
        />
      </section>
    )
  }

  if (!detail) {
    return (
      <section className="mx-auto max-w-2xl py-8">
        <EmptyState
          title="Không tìm thấy bài nộp"
          description="Bài nộp không tồn tại hoặc bạn không có quyền xem."
          action={
            <Link to={ROUTES.student.history}>
              <Button variant="secondary">Về lịch sử</Button>
            </Link>
          }
        />
      </section>
    )
  }

  const canResume = canResumeSubmission(detail)
  const showScoreBlock = detail.status === 'SUBMITTED'
  const showQuestionDetails =
    sortedDetails.length > 0 && (detail.scoreVisible || detail.status !== 'SUBMITTED')
  const showCorrectInQuestions = detail.scoreVisible && detail.status === 'SUBMITTED'

  return (
    <section className="flex min-h-[36rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-5">
        <Link
          to={ROUTES.student.history}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại lịch sử
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                Chi tiết {isPractice ? 'luyện tập' : 'bài thi'}
              </p>
              <span
                className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${PURPOSE_BADGE[purpose]}`}
              >
                {PURPOSE_LABEL[purpose]}
              </span>
              <span
                className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE[detail.status]}`}
              >
                {SUBMISSION_STATUS_LABEL[detail.status]}
              </span>
            </div>
            <h1 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">{detail.examTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Lần {detail.attemptNo}
              {!isPractice && detail.versionCode ? ` · Mã đề ${detail.versionCode}` : ''}
              {detail.classroomName ? ` · ${detail.classroomName}` : ''}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {detail.submitTime
                ? `Nộp lúc: ${formatSubmissionDateTime(detail.submitTime)}`
                : `Bắt đầu: ${formatSubmissionDateTime(detail.startTime)} · Chưa nộp`}
            </p>
          </div>

          {showScoreBlock ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              {!detail.scoreVisible ? (
                <p className="text-sm text-slate-600">Chưa công bố điểm</p>
              ) : detail.score != null && detail.maxScore != null ? (
                <>
                  <p className="text-xs text-slate-500">Điểm</p>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">
                    {formatSubmissionScore(detail.score, detail.maxScore)}
                  </p>
                  {detail.correctQuestions != null && detail.totalQuestions != null ? (
                    <p className="mt-0.5 text-xs text-slate-500">
                      Đúng {detail.correctQuestions}/{detail.totalQuestions}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-slate-600">Chưa công bố điểm</p>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {showQuestionDetails ? (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="max-h-40 shrink-0 overflow-hidden border-b border-slate-200 lg:max-h-none lg:h-auto lg:min-h-[28rem] lg:border-b-0">
            <QuestionNav
              items={sortedDetails}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {currentItem ? (
                <StudentSubmissionQuestionItem
                  item={currentItem}
                  showCorrectAnswer={showCorrectInQuestions}
                />
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 sm:px-6">
              <Button
                type="button"
                variant="secondary"
                className="h-10 px-4"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
              >
                Câu trước
              </Button>
              <p className="text-xs text-slate-500">
                Câu {currentIndex + 1}/{sortedDetails.length}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="h-10 px-4"
                disabled={currentIndex >= sortedDetails.length - 1}
                onClick={() =>
                  setCurrentIndex((value) => Math.min(sortedDetails.length - 1, value + 1))
                }
              >
                Câu sau
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 py-8 text-center text-sm text-slate-500">
          Không có chi tiết câu hỏi để hiển thị.
        </div>
      )}

      <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:px-5">
        {canResume ? (
          <Button className="w-full sm:w-auto" onClick={handleResume} disabled={!detail.classroomId}>
            <Play className="h-4 w-4" strokeWidth={1.75} />
            {isPractice ? 'Tiếp tục luyện tập' : 'Tiếp tục làm bài'}
          </Button>
        ) : null}

        {detail.status === 'EXPIRED' ? (
          <p className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 sm:flex-1">
            {isPractice ? 'Bài luyện tập đã hết giờ, không thể nộp' : 'Bài thi đã hết giờ, không thể nộp'}
          </p>
        ) : null}

        {detail.status === 'SUBMITTED' || !canResume ? (
          <Link to={ROUTES.student.history} className={canResume ? 'w-full sm:w-auto' : 'w-full'}>
            <Button variant="secondary" className="w-full">
              Quay lại danh sách
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  )
}
