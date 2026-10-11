import { ArrowRight, BookOpen, Users } from 'lucide-react'

import { INTERACTIVE_CARD_HOVER_CLASS } from '../../../constants/ui'

export type OmrClassroomCardItem = {
  id: number
  className: string
  subjectName?: string | null
}

type OmrClassroomCardProps = {
  classroom: OmrClassroomCardItem
  selected?: boolean
  onSelect: (classroomId: number) => void
}

export function OmrClassroomCard({ classroom, selected = false, onSelect }: OmrClassroomCardProps) {
  const subjectLabel = classroom.subjectName?.trim() || '—'

  return (
    <button
      type="button"
      onClick={() => onSelect(classroom.id)}
      className={`flex w-full flex-col rounded-2xl border p-5 text-left shadow-sm ${
        selected
          ? 'border-blue-300 bg-blue-50/80 ring-2 ring-blue-100'
          : `border-slate-200 bg-white ${INTERACTIVE_CARD_HOVER_CLASS}`
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Users className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <ArrowRight
          className={`mt-1 h-4 w-4 shrink-0 ${selected ? 'text-blue-600' : 'text-slate-400'}`}
          strokeWidth={1.75}
        />
      </div>

      <p className="truncate text-base font-semibold text-slate-900" title={classroom.className}>
        {classroom.className}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
        <BookOpen className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate" title={subjectLabel}>
          {subjectLabel}
        </span>
      </p>
    </button>
  )
}
