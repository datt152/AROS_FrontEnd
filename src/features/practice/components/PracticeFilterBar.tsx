import type { PracticeClassroomOption, PracticeStatus, PracticeSubjectOption } from '../types/practice.types'
import { PRACTICE_STATUS_LABEL } from '../types/practice.types'

type PracticeFilterBarProps = {
  subjects: PracticeSubjectOption[]
  classrooms: PracticeClassroomOption[]
  subjectId: number | ''
  classroomId: number | ''
  status: PracticeStatus | ''
  onSubjectChange: (value: number | '') => void
  onClassroomChange: (value: number | '') => void
  onStatusChange: (value: PracticeStatus | '') => void
}

const selectClassName =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

export function PracticeFilterBar({
  subjects,
  classrooms,
  subjectId,
  classroomId,
  status,
  onSubjectChange,
  onClassroomChange,
  onStatusChange,
}: PracticeFilterBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
      <div className="space-y-1.5">
        <label htmlFor="practice-filter-subject" className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Môn học
        </label>
        <select
          id="practice-filter-subject"
          value={subjectId}
          onChange={(event) => onSubjectChange(event.target.value === '' ? '' : Number(event.target.value))}
          className={selectClassName}
        >
          <option value="">Tất cả môn</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="practice-filter-classroom" className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Lớp học
        </label>
        <select
          id="practice-filter-classroom"
          value={classroomId}
          onChange={(event) => onClassroomChange(event.target.value === '' ? '' : Number(event.target.value))}
          className={selectClassName}
        >
          <option value="">Tất cả lớp</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.className}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="practice-filter-status" className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Trạng thái
        </label>
        <select
          id="practice-filter-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value === '' ? '' : (event.target.value as PracticeStatus))
          }
          className={selectClassName}
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.keys(PRACTICE_STATUS_LABEL) as PracticeStatus[]).map((key) => (
            <option key={key} value={key}>
              {PRACTICE_STATUS_LABEL[key]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
