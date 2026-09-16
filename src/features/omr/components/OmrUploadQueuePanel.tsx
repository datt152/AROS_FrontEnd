import { AlertTriangle, CheckCircle2, Eye, LoaderCircle, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useState, type RefObject } from 'react'

import { Button } from '../../../components/ui/Button'
import type { ResolvedOmrError } from '../lib/omrErrors'

export type OmrUploadItemStatus = 'queued' | 'uploading' | 'done' | 'error'

export type OmrUploadQueueItem = {
  id: string
  file: File
  previewUrl: string
  status: OmrUploadItemStatus
  progress: number
  error?: ResolvedOmrError
}

type OmrUploadQueuePanelProps = {
  canUpload: boolean
  sessionOpen: boolean
  uploading: boolean
  dragOver: boolean
  items: OmrUploadQueueItem[]
  fileRef: RefObject<HTMLInputElement | null>
  accept: string
  onDragOver: (over: boolean) => void
  onDropFiles: (files: FileList | null) => void
  onPickFiles: (files: FileList | null) => void
  onOpenPicker: () => void
  onClearQueue: () => void
}

export function OmrUploadQueuePanel({
  canUpload,
  sessionOpen,
  uploading,
  dragOver,
  items,
  fileRef,
  accept,
  onDragOver,
  onDropFiles,
  onPickFiles,
  onOpenPicker,
  onClearQueue,
}: OmrUploadQueuePanelProps) {
  const [previewItem, setPreviewItem] = useState<OmrUploadQueueItem | null>(null)

  const selected = items.length
  const done = items.filter((item) => item.status === 'done').length
  const active = items.filter((item) => item.status === 'uploading' || item.status === 'queued').length
  const failed = items.filter((item) => item.status === 'error').length

  useEffect(() => {
    if (!previewItem) return
    const stillExists = items.some((item) => item.id === previewItem.id)
    if (!stillExists) setPreviewItem(null)
  }, [items, previewItem])

  return (
    <div className="space-y-3">
      <section
        className={`rounded-2xl border border-dashed p-6 transition ${
          dragOver ? 'border-blue-400 bg-blue-50/60' : 'border-slate-300 bg-white'
        } ${canUpload ? '' : 'opacity-70'}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (canUpload) onDragOver(true)
        }}
        onDragLeave={() => onDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          onDragOver(false)
          onDropFiles(e.dataTransfer.files)
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Upload className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium text-slate-800">
            {!sessionOpen
              ? 'Phiên đã khóa — không tải thêm phiếu'
              : uploading
                ? 'Đang tải và chấm phiếu...'
                : 'Kéo thả ảnh phiếu trả lời vào đây'}
          </p>
          <p className="mt-1 text-xs text-slate-500">JPG hoặc PNG, tối đa 10MB mỗi file</p>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            disabled={!canUpload}
            onChange={(e) => {
              onPickFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <Button
            className="mt-4"
            variant={canUpload ? 'primary' : 'secondary'}
            disabled={!canUpload}
            onClick={onOpenPicker}
          >
            {uploading ? 'Đang tải...' : 'Chọn ảnh'}
          </Button>
        </div>
      </section>

      {selected > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
              <span>
                Đã chọn <span className="font-semibold text-slate-900">{selected}</span> ảnh
              </span>
              <span>
                Hoàn tất <span className="font-semibold text-emerald-600">{done}</span>
              </span>
              <span>
                Đang tải <span className="font-semibold text-blue-600">{active}</span>
              </span>
              <span>
                Lỗi <span className="font-semibold text-red-600">{failed}</span>
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="h-9 gap-1.5 px-3"
              disabled={uploading}
              onClick={onClearQueue}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Xóa danh sách
            </Button>
          </div>

          <ul className="space-y-2">
            {items.map((item) => (
              <UploadQueueRow key={item.id} item={item} onView={() => setPreviewItem(item)} />
            ))}
          </ul>
        </>
      ) : null}

      {previewItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh upload"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900" title={previewItem.file.name}>
                  {previewItem.file.name}
                </p>
                {previewItem.error ? (
                  <p className="mt-0.5 text-xs text-red-600">
                    {previewItem.error.description || previewItem.error.title}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Đóng"
                onClick={() => setPreviewItem(null)}
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-50 p-4">
              <img
                src={previewItem.previewUrl}
                alt={previewItem.file.name}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function UploadQueueRow({ item, onView }: { item: OmrUploadQueueItem; onView: () => void }) {
  if (item.status === 'error') {
    return (
      <li className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-red-700" title={item.file.name}>
            {item.file.name}
          </p>
          <p className="mt-0.5 text-xs text-red-600">
            {item.error?.description || item.error?.title || 'Upload thất bại'}
          </p>
        </div>
        <Button type="button" variant="secondary" className="h-9 shrink-0 gap-1.5 px-3" onClick={onView}>
          <Eye className="h-4 w-4" strokeWidth={1.75} />
          Xem ảnh
        </Button>
      </li>
    )
  }

  if (item.status === 'uploading' || item.status === 'queued') {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
        <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-blue-600" strokeWidth={1.75} />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800" title={item.file.name}>
          {item.file.name}
        </p>
        <p className="shrink-0 text-sm text-slate-500">
          {item.status === 'queued' ? 'Chờ tải...' : `Đang tải lên · ${item.progress}%`}
        </p>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" strokeWidth={1.75} />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800" title={item.file.name}>
        {item.file.name}
      </p>
      <Button type="button" variant="secondary" className="h-9 shrink-0 gap-1.5 px-3" onClick={onView}>
        <Eye className="h-4 w-4" strokeWidth={1.75} />
        Xem ảnh
      </Button>
    </li>
  )
}
