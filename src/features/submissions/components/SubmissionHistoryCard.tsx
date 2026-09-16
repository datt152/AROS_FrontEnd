import { Lock, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { studentHistoryDetailPath, ROUTES } from '../../../routes/routes.config'
import { INTERACTIVE_CARD_HOVER_CLASS } from '../../../constants/ui'
import {
  PURPOSE_BADGE,
  PURPOSE_LABEL,
  SUBMISSION_STATUS_BADGE,
  SUBMISSION_STATUS_LABEL,
  canResumeSubmission,
  formatSubmissionDateTime,
  getSubmissionListScoreDisplay,
  type StudentSubmissionItem,
  type SubmissionDetailLocationState,
} from '../types/submission.types'

type SubmissionHistoryCardProps = {
  item: StudentSubmissionItem
}

export function SubmissionHistoryCard({ item }: SubmissionHistoryCardProps) {
  const navigate = useNavigate()
  const scoreDisplay = getSubmissionListScoreDisplay(item)
  const canResume = canResumeSubmission(item)

  function handleOpenDetail() {
    void navigate(studentHistoryDetailPath(item.submissionId), {
      state: { purpose: item.purpose } satisfies SubmissionDetailLocationState,
    })
  }

  function handleResume(event: React.MouseEvent) {
    event.stopPropagation()
    if (!item.classroomId) return
    const state = { examId: item.examId, classroomId: item.classroomId }
    const path = item.purpose === 'PRACTICE' ? ROUTES.student.takePractice : ROUTES.student.takeExam
    void navigate(path, { state })
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpenDetail()
        }
      }}
      className={`cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${INTERACTIVE_CARD_HOVER_CLASS}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{item.examTitle}</h3>
            <span
              className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${PURPOSE_BADGE[item.purpose]}`}
            >
              {PURPOSE_LABEL[item.purpose]}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Lần {item.attemptNo}
            {item.versionCode ? ` · Mã đề ${item.versionCode}` : ''}
            {item.classroomName ? ` · ${item.classroomName}` : ''}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {item.submitTime
              ? `Đã nộp: ${formatSubmissionDateTime(item.submitTime)}`
              : `Bắt đầu: ${formatSubmissionDateTime(item.startTime)}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span
            className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${SUBMISSION_STATUS_BADGE[item.status]}`}
          >
            {SUBMISSION_STATUS_LABEL[item.status]}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 text-sm text-slate-700">
          <span className="text-slate-500">Điểm:</span>
          {scoreDisplay.locked ? (
            <span className="inline-flex items-center gap-1 font-medium text-slate-600" title="Điểm chưa công bố">
              <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
              {scoreDisplay.text}
            </span>
          ) : (
            <span className="font-semibold tabular-nums text-slate-900">{scoreDisplay.text}</span>
          )}
        </div>

        {canResume ? (
          <Button
            className="w-full sm:w-auto"
            onClick={handleResume}
            disabled={!item.classroomId}
            title={!item.classroomId ? 'Thiếu thông tin lớp — mở từ danh sách đề theo lớp' : undefined}
          >
            <Play className="h-4 w-4" strokeWidth={1.75} />
            Tiếp tục
          </Button>
        ) : (
          <span className="text-xs text-slate-400">Nhấn để xem chi tiết</span>
        )}
      </div>
    </article>
  )
}
