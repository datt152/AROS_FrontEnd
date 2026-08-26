import { FolderOpen, Pencil, Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import type { TopicItem as TopicItemType } from '../types/topic.types'

type TopicItemProps = {
  topic: TopicItemType
  onOpen: (topic: TopicItemType) => void
  onEdit: (topic: TopicItemType) => void
  onDelete: (topic: TopicItemType) => void
}

export function TopicItem({ topic, onOpen, onEdit, onDelete }: TopicItemProps) {
  return (
    <article className="flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <button type="button" onClick={() => onOpen(topic)} className="flex flex-1 flex-col text-left">
        <div className="mb-3 flex items-start gap-3">
          <div className="inline-flex shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <FolderOpen className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-semibold text-slate-900">{topic.name}</p>
            {topic.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{topic.description}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Không có mô tả</p>
            )}
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm text-slate-500">
          <span>{topic.questionCount} câu hỏi</span>
          <span className="text-xs text-slate-400">Thứ tự {topic.displayOrder}</span>
        </div>
      </button>

      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
        <Button
          variant="ghost"
          className="h-8 flex-1 border border-amber-200 bg-amber-50 px-2.5 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900"
          onClick={() => onEdit(topic)}
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          Sửa
        </Button>
        <Button
          variant="ghost"
          className="h-8 flex-1 border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 hover:bg-red-100 hover:text-red-800"
          onClick={() => onDelete(topic)}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Xóa
        </Button>
      </div>
    </article>
  )
}
