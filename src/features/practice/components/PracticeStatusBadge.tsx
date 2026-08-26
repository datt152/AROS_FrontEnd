import type { PracticeStatus } from '../types/practice.types'
import { PRACTICE_STATUS_BADGE_CLASS, PRACTICE_STATUS_LABEL } from '../types/practice.types'

export function PracticeStatusBadge({ status }: { status: PracticeStatus }) {
  return (
    <span
      className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${PRACTICE_STATUS_BADGE_CLASS[status]}`}
      title="Trạng thái đề luyện tập"
    >
      {PRACTICE_STATUS_LABEL[status]}
    </span>
  )
}
