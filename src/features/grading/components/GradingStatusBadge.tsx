import type { GradingStudentStatus } from '../types/grading.types'
import { GRADING_STATUS_BADGE_CLASS, GRADING_STATUS_LABEL } from '../types/grading.types'

type GradingStatusBadgeProps = {
  status: GradingStudentStatus
}

export function GradingStatusBadge({ status }: GradingStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${GRADING_STATUS_BADGE_CLASS[status]}`}>
      {GRADING_STATUS_LABEL[status]}
    </span>
  )
}
