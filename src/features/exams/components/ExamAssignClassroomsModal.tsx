import { useMemo, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import type { ClassroomOption, ExamItem } from '../types/exam.types'

type ExamAssignClassroomsModalProps = {
  exam: ExamItem
  classroomOptions: ClassroomOption[]
  isSubmitting?: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (classroomIds: number[]) => void | Promise<void>
}

export function ExamAssignClassroomsModal({
  exam,
  classroomOptions,
  isSubmitting = false,
  submitError = null,
  onClose,
  onSubmit,
}: ExamAssignClassroomsModalProps) {
  const available = useMemo(
    () => classroomOptions.filter((classroom) => classroom.subjectId === exam.subjectId),
    [classroomOptions, exam.subjectId],
  )
  const [selectedIds, setSelectedIds] = useState<number[]>(exam.classroomIds ?? [])

  function toggle(id: number) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Giao lớp</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{exam.title}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{exam.subjectName}</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Đóng">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {submitError ? (
          <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
        ) : null}

        {available.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
            Không có lớp cùng môn để giao.
          </p>
        ) : (
          <ul className="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">
            {available.map((classroom) => (
              <li key={classroom.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(classroom.id)}
                    disabled={isSubmitting}
                    onChange={() => toggle(classroom.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-900">{classroom.className}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" disabled={isSubmitting} onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="flex-1"
            disabled={isSubmitting}
            onClick={() => void onSubmit(selectedIds)}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu lớp giao'}
          </Button>
        </div>
      </div>
    </div>
  )
}
