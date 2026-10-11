import { BookOpen, ChevronRight, Users } from 'lucide-react'

import { INTERACTIVE_CARD_HOVER_CLASS } from '../../../constants/ui'
import type { ClassroomItem } from '../../classrooms/types/classroom.types'

type StudentClassroomCardProps = {
  item: ClassroomItem
  selected: boolean
  onSelect: (item: ClassroomItem) => void
}

export function StudentClassroomSubjectCard({ item, selected, onSelect }: StudentClassroomCardProps) {
  const teacherLabel = item.teacherName || item.teacherEmail || 'Giáo viên'

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left ${
        selected
          ? 'border-blue-300 bg-blue-50/80 shadow-sm ring-2 ring-blue-100'
          : `border-slate-200 bg-white ${INTERACTIVE_CARD_HOVER_CLASS}`
      }`}
    >
      <span
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
        }`}
      >
        <BookOpen className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-slate-900">
          {item.subjectName || `Môn #${item.subjectId}`}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
            {item.className}
          </span>
          <span aria-hidden>·</span>
          <span className="truncate">{teacherLabel}</span>
        </span>
      </span>
      <ChevronRight
        className={`mt-2 h-4 w-4 shrink-0 ${selected ? 'text-blue-600' : 'text-slate-400'}`}
        strokeWidth={1.75}
      />
    </button>
  )
}
