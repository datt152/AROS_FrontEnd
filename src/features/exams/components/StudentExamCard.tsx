import { Clock, FileQuestion, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { INTERACTIVE_CARD_HOVER_CLASS } from '../../../constants/ui'
import { ROUTES } from '../../../routes/routes.config'
import {
  STUDENT_EXAM_STATUS_BADGE,
  STUDENT_EXAM_STATUS_LABEL,
  STUDENT_MY_STATUS_BADGE,
  STUDENT_MY_STATUS_LABEL,
  canShowStudentScoreOnCard,
  formatStudentExamSchedule,
  formatStudentScore,
  getStudentTakeBlockReason,
  type StudentExamListItem,
  type TakeExamLocationState,
} from '../types/studentExam.types'

type StudentExamCardProps = {
  exam: StudentExamListItem
  /** Lớp đang xem — bắt buộc khi vào làm bài để điểm đúng theo lớp */
  classroomId: number
  /** EXAM → take-exam; PRACTICE → practice/take */
  mode?: 'EXAM' | 'PRACTICE'
}

export function StudentExamCard({ exam, classroomId, mode = 'EXAM' }: StudentExamCardProps) {
  const navigate = useNavigate()
  const blockReason = getStudentTakeBlockReason(exam)
  const showScore = canShowStudentScoreOnCard(exam)
  const isPractice = mode === 'PRACTICE'

  function handleTake() {
    const state: TakeExamLocationState = { examId: exam.id, classroomId }
    void navigate(isPractice ? ROUTES.student.takePractice : ROUTES.student.takeExam, { state })
  }

  const takeLabel = exam.myStatus === 'IN_PROGRESS'
    ? 'Tiếp tục làm'
    : exam.myStatus === 'SUBMITTED' && exam.canTake
      ? 'Làm lại'
      : isPractice
        ? 'Vào luyện tập'
        : 'Vào làm bài'

  return (
    <article className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${INTERACTIVE_CARD_HOVER_CLASS}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{exam.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatStudentExamSchedule(exam.startAt, exam.endAt)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
              {exam.timeLimitEnabled ? `${exam.duration} phút` : 'Không giới hạn giờ'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
              <FileQuestion className="h-3.5 w-3.5" strokeWidth={1.75} />
              {exam.totalQuestions > 0 ? `${exam.totalQuestions} câu · ` : ''}
              {exam.maxScore} điểm
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span
            className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${STUDENT_EXAM_STATUS_BADGE[exam.examStatus]}`}
          >
            {STUDENT_EXAM_STATUS_LABEL[exam.examStatus]}
          </span>
          <span
            className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${STUDENT_MY_STATUS_BADGE[exam.myStatus]}`}
          >
            {STUDENT_MY_STATUS_LABEL[exam.myStatus]}
          </span>
        </div>
      </div>

      {showScore ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <p className="text-xs font-medium text-emerald-700">Điểm của bạn</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
            {formatStudentScore(exam.myScore!, exam.maxScore)}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        {showScore && !exam.canTake ? (
          <p className="text-sm text-slate-500">Bạn đã nộp bài</p>
        ) : blockReason && !exam.canTake ? (
          <p className="text-sm text-slate-500">{blockReason}</p>
        ) : (
          <p className="text-sm text-emerald-700">
            {exam.myStatus === 'IN_PROGRESS'
              ? 'Bạn đang làm dở — tiếp tục vào bài.'
              : exam.myStatus === 'SUBMITTED' && exam.canTake
                ? 'Bạn còn lượt làm lại.'
                : isPractice
                  ? 'Có thể vào luyện tập.'
                  : 'Có thể vào làm bài.'}
          </p>
        )}

        {exam.canTake ? (
          <Button className="w-full sm:w-auto" onClick={handleTake}>
            <Play className="h-4 w-4" strokeWidth={1.75} />
            {takeLabel}
          </Button>
        ) : (
          <Button className="w-full sm:w-auto" disabled>
            Không thể làm
          </Button>
        )}
      </div>
    </article>
  )
}
