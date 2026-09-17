import { Search } from 'lucide-react'

import { Input } from '../../../components/ui/Input'
import {
  STUDENT_EXAM_STATUS_LABEL,
  STUDENT_MY_STATUS_LABEL,
  type StudentExamSortMode,
  type StudentExamStatus,
  type StudentMyStatus,
} from '../types/studentExam.types'

const selectClass =
  'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30'

type StudentExamListToolbarProps = {
  search: string
  examStatus: StudentExamStatus | ''
  myStatus: StudentMyStatus | ''
  sortMode: StudentExamSortMode
  /** EXAM → "Trạng thái bài thi"; PRACTICE → "Trạng thái bài luyện tập" */
  mode?: 'EXAM' | 'PRACTICE'
  searchPlaceholder?: string
  onSearchChange: (value: string) => void
  onExamStatusChange: (value: StudentExamStatus | '') => void
  onMyStatusChange: (value: StudentMyStatus | '') => void
  onSortModeChange: (value: StudentExamSortMode) => void
}

export function StudentExamListToolbar({
  search,
  examStatus,
  myStatus,
  sortMode,
  mode = 'EXAM',
  searchPlaceholder = 'Tìm theo tên bài...',
  onSearchChange,
  onExamStatusChange,
  onMyStatusChange,
  onSortModeChange,
}: StudentExamListToolbarProps) {
  const scheduleStatusLabel =
    mode === 'PRACTICE' ? 'Trạng thái bài luyện tập' : 'Trạng thái bài thi'
  const scheduleStatusAllLabel =
    mode === 'PRACTICE' ? 'Tất cả trạng thái luyện tập' : 'Tất cả trạng thái bài thi'

  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          placeholder={searchPlaceholder}
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-slate-500">{scheduleStatusLabel}</span>
          <select
            className={`w-full ${selectClass}`}
            value={examStatus}
            onChange={(event) => onExamStatusChange(event.target.value as StudentExamStatus | '')}
          >
            <option value="">{scheduleStatusAllLabel}</option>
            {(Object.keys(STUDENT_EXAM_STATUS_LABEL) as StudentExamStatus[]).map((key) => (
              <option key={key} value={key}>
                {STUDENT_EXAM_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Bài làm của bạn</span>
          <select
            className={`w-full ${selectClass}`}
            value={myStatus}
            onChange={(event) => onMyStatusChange(event.target.value as StudentMyStatus | '')}
          >
            <option value="">Tất cả bài làm</option>
            {(Object.keys(STUDENT_MY_STATUS_LABEL) as StudentMyStatus[]).map((key) => (
              <option key={key} value={key}>
                {STUDENT_MY_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Sắp xếp</span>
          <select
            className={`w-full ${selectClass}`}
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value as StudentExamSortMode)}
          >
            <option value="priority">Ưu tiên đang diễn ra</option>
            <option value="date_desc">Ngày bắt đầu mới → cũ</option>
            <option value="date_asc">Ngày bắt đầu cũ → mới</option>
          </select>
        </label>
      </div>
    </div>
  )
}
