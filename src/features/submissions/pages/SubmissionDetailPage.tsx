import { ArrowLeft, Play } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { ROUTES } from '../../../routes/routes.config'
import { StudentSubmissionQuestionItem } from '../components/StudentSubmissionQuestionItem'
import { useMySubmissionDetail } from '../hooks/useSubmissions'
import {
  PURPOSE_BADGE,
  PURPOSE_LABEL,
  SUBMISSION_STATUS_BADGE,
  SUBMISSION_STATUS_LABEL,
  canResumeSubmission,
  formatSubmissionDateTime,
  formatSubmissionScore,
} from '../types/submission.types'

function parseSubmissionId(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function SubmissionDetailPage() {
  const navigate = useNavigate()
  const { submissionId: submissionIdParam } = useParams<{ submissionId: string }>()
  const submissionId = parseSubmissionId(submissionIdParam)

  const detailQuery = useMySubmissionDetail(submissionId)
  const detail = detailQuery.data

  function handleResume() {
    if (!detail) return
    const state = { examId: detail.examId }
    const path = detail.purpose === 'PRACTICE' ? ROUTES.student.takePractice : ROUTES.student.takeExam
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
  const showQuestionDetails = detail.details.length > 0 && (detail.scoreVisible || detail.status !== 'SUBMITTED')
  const showCorrectInQuestions = detail.scoreVisible && detail.status === 'SUBMITTED'

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          to={ROUTES.student.history}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại lịch sử
        </Link>
      </div>

      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Chi tiết lần làm</p>
          <span
            className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${PURPOSE_BADGE[detail.purpose]}`}
          >
            {PURPOSE_LABEL[detail.purpose]}
          </span>
          <span
            className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE[detail.status]}`}
          >
            {SUBMISSION_STATUS_LABEL[detail.status]}
          </span>
        </div>

        <h1 className="mt-2 text-xl font-semibold text-slate-900">{detail.examTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lần {detail.attemptNo}
          {detail.versionCode ? ` · Mã đề ${detail.versionCode}` : ''}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {detail.submitTime
            ? `Nộp lúc: ${formatSubmissionDateTime(detail.submitTime)}`
            : `Bắt đầu: ${formatSubmissionDateTime(detail.startTime)} · Chưa nộp`}
        </p>

        {showScoreBlock ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            {!detail.scoreVisible ? (
              <p className="text-sm text-slate-600">Giáo viên chưa công bố điểm</p>
            ) : detail.score != null && detail.maxScore != null ? (
              <>
                <p className="text-sm text-slate-600">Điểm</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                  {formatSubmissionScore(detail.score, detail.maxScore)}
                </p>
                {detail.correctQuestions != null && detail.totalQuestions != null ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Đúng: {detail.correctQuestions}/{detail.totalQuestions} câu
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-600">Giáo viên chưa công bố điểm</p>
            )}
          </div>
        ) : null}
      </header>

      {showQuestionDetails ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chi tiết câu trả lời</p>
          {detail.details
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <StudentSubmissionQuestionItem
                key={item.questionId}
                item={item}
                showCorrectAnswer={showCorrectInQuestions}
              />
            ))}
        </div>
      ) : null}

      <div className="sticky bottom-4 flex flex-col gap-2 sm:flex-row">
        {canResume ? (
          <Button className="w-full" onClick={handleResume}>
            <Play className="h-4 w-4" strokeWidth={1.75} />
            Tiếp tục làm bài
          </Button>
        ) : null}

        {detail.status === 'EXPIRED' ? (
          <p className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            Bài đã hết giờ, không thể nộp
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
