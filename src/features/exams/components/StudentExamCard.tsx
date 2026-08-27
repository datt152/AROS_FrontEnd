import { Clock, FileQuestion, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../routes/routes.config'
import {
  STUDENT_EXAM_STATUS_BADGE,
  STUDENT_EXAM_STATUS_LABEL,
  STUDENT_MY_STATUS_BADGE,
  STUDENT_MY_STATUS_LABEL,
  formatStudentExamSchedule,
  getStudentTakeBlockReason,
  type StudentExamListItem,
} from '../types/studentExam.types'

type StudentExamCardProps = {
  exam: StudentExamListItem
}

export function StudentExamCard({ exam }: StudentExamCardProps) {
  const blockReason = getStudentTakeBlockReason(exam)
  const takePath = ROUTES.student.takeExam.replace(':examId', String(exam.id))

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{exam.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatStudentExamSchedule(exam.startAt, exam.endAt)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
              {exam.duration} phút
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
              <FileQuestion className="h-3.5 w-3.5" strokeWidth={1.75} />
              {exam.totalQuestions} câu · {exam.maxScore} điểm
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

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        {blockReason ? (
          <p className="text-sm text-slate-500">{blockReason}</p>
        ) : (
          <p className="text-sm text-emerald-700">
            {exam.myStatus === 'IN_PROGRESS' ? 'Bạn đang làm dở — tiếp tục vào bài.' : 'Có thể vào làm bài.'}
          </p>
        )}

        {exam.canTake ? (
          <Link to={takePath} className="sm:shrink-0">
            <Button className="w-full sm:w-auto">
              <Play className="h-4 w-4" strokeWidth={1.75} />
              {exam.myStatus === 'IN_PROGRESS' ? 'Tiếp tục làm' : 'Vào làm bài'}
            </Button>
          </Link>
        ) : (
          <Button className="w-full sm:w-auto" disabled>
            Không thể làm
          </Button>
        )}
      </div>
    </article>
  )
}
