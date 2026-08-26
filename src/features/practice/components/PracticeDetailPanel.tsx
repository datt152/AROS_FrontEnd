import { FileCode2, Lock, Pencil, Play, Users, X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import type { PracticeItem } from '../types/practice.types'
import { formatMaxAttempts, formatTimeLimit } from '../types/practice.types'
import { PracticeStatusBadge } from './PracticeStatusBadge'

type PracticeDetailPanelProps = {
  item: PracticeItem
  onClose: () => void
  onEdit: (item: PracticeItem) => void
  onAssign: (item: PracticeItem) => void
  onGenerateVersions: (item: PracticeItem) => void
  onOpen: (item: PracticeItem) => void
  onClosePractice: (item: PracticeItem) => void
}

export function PracticeDetailPanel({
  item,
  onClose,
  onEdit,
  onAssign,
  onGenerateVersions,
  onOpen,
  onClosePractice,
}: PracticeDetailPanelProps) {
  const isDraft = item.status === 'DRAFT'
  const isOpen = item.status === 'ONGOING' || item.status === 'UPCOMING'
  const canOpen = isDraft && item.classroomIds.length > 0 && item.versionCodes.length > 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Đóng" onClick={onClose} />
      <aside className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Chi tiết luyện tập</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{item.subjectName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PracticeStatusBadge status={item.status} />
            <span className="text-xs text-slate-400">Trạng thái đề (không phải trạng thái từng SV)</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Hiện điểm SV</p>
              <p className="mt-0.5 font-medium text-slate-900">Có (cố định)</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Số lần làm</p>
              <p className="mt-0.5 font-medium text-slate-900">{formatMaxAttempts(item.config.maxAttempts)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Giới hạn giờ</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {formatTimeLimit(item.config.timeLimitEnabled, item.duration)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Số lớp đã giao</p>
              <p className="mt-0.5 font-medium text-slate-900">{item.classroomIds.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Thang điểm</p>
              <p className="mt-0.5 font-medium text-slate-900">{item.maxScore}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Số câu</p>
              <p className="mt-0.5 font-medium text-slate-900">{item.totalQuestions}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400">Mã đề</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {item.versionCodes.length === 0 ? 'Chưa sinh mã' : item.versionCodes.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isDraft ? (
              <>
                <Button variant="secondary" onClick={() => onEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Sửa
                </Button>
                <Button variant="secondary" onClick={() => onAssign(item)}>
                  <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Giao lớp
                </Button>
                <Button variant="secondary" onClick={() => onGenerateVersions(item)}>
                  <FileCode2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Sinh mã
                </Button>
                <Button disabled={!canOpen} onClick={() => onOpen(item)}>
                  <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Mở luyện tập
                </Button>
              </>
            ) : null}
            {isOpen ? (
              <Button variant="secondary" onClick={() => onClosePractice(item)}>
                <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
                Đóng bài
              </Button>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  )
}
