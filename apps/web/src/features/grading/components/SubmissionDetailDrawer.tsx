import { X } from 'lucide-react'

import { EmptyState } from '../../../components/ui/EmptyState'
import type { SubmissionDetail } from '../types/grading.types'
import { formatGradingDateTime } from '../types/grading.types'
import { GradingStatusBadge } from './GradingStatusBadge'
import { SubmissionQuestionItem } from './SubmissionQuestionItem'

type SubmissionDetailDrawerProps = {
  detail: SubmissionDetail
  onClose: () => void
}

export function SubmissionDetailDrawer({ detail, onClose }: SubmissionDetailDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Đóng bảng" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Chi tiết bài nộp</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{detail.fullName}</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {detail.studentCode} · {detail.email}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <GradingStatusBadge status={detail.status} />
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              Mã đề {detail.versionCode}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Đề thi</p>
              <p className="mt-0.5 font-medium text-slate-900">{detail.examTitle}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Điểm</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {detail.score === null || detail.score === undefined ? '—' : `${detail.score}/${detail.maxScore}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Đúng / Tổng</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {detail.correctQuestions}/{detail.totalQuestions}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Bắt đầu</p>
              <p className="mt-0.5 font-medium text-slate-900">{formatGradingDateTime(detail.startTime)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400">Nộp lúc</p>
              <p className="mt-0.5 font-medium text-slate-900">{formatGradingDateTime(detail.submitTime)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {detail.details.length === 0 ? (
            <EmptyState
              title="Chưa có chi tiết câu trả lời"
              description="Bài nộp này chưa có dữ liệu từng câu (có thể là bản nháp hoặc chưa hoàn tất)."
            />
          ) : (
            detail.details
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((item) => <SubmissionQuestionItem key={item.questionId} item={item} />)
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Quay lại bảng chấm điểm
          </button>
        </div>
      </aside>
    </div>
  )
}
