import { ArrowLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableCol,
  TableColGroup,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/Table'
import { getApiErrorMessage } from '../../../lib/apiError'
import { omrSessionsPath, omrSheetPath, ROUTES } from '../../../routes/routes.config'
import {
  OmrUploadQueuePanel,
  type OmrUploadQueueItem,
} from '../components/OmrUploadQueuePanel'
import { useExamSession, useOmrSheets, useUploadOmrSheet } from '../hooks/useOmr'
import { parseOmrApiError, resolveOmrError, type ResolvedOmrError } from '../lib/omrErrors'
import type { OmrSheetStatus } from '../types/omr.types'
import {
  EXAM_SESSION_STATUS_BADGE,
  EXAM_SESSION_STATUS_LABEL,
  formatOmrDateTime,
  formatOmrScore,
  OMR_SHEET_STATUS_BADGE,
  OMR_SHEET_STATUS_LABEL,
} from '../types/omr.types'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,.jpg,.jpeg,.png'

function makeUploadId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function revokePreviewUrls(items: OmrUploadQueueItem[]) {
  items.forEach((item) => {
    URL.revokeObjectURL(item.previewUrl)
  })
}

function validateFile(file: File): ResolvedOmrError | null {
  const okType = /image\/(jpeg|png)/i.test(file.type) || /\.(jpe?g|png)$/i.test(file.name)
  if (!okType) {
    return resolveOmrError({ error_code: 'OMR_VAL_INVALID_CONTENT_TYPE' }, { fileName: file.name })
  }
  if (file.size === 0) {
    return resolveOmrError({ error_code: 'OMR_VAL_EMPTY_FILE' }, { fileName: file.name })
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      code: 'OMR_VAL_FILE_TOO_LARGE',
      kind: 'validation',
      title: 'File quá lớn',
      description: 'Tối đa 10MB mỗi ảnh.',
      fileName: file.name,
    }
  }
  return null
}

export function OmrSessionWorkspacePage() {
  const { sessionId: sessionIdParam } = useParams()
  const sessionId = Number(sessionIdParam)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const processingRef = useRef(false)
  const uploadQueueRef = useRef<OmrUploadQueueItem[]>([])
  const validSessionId = Number.isFinite(sessionId) && sessionId > 0 ? sessionId : undefined

  const sessionQuery = useExamSession(validSessionId)
  const sheetsQuery = useOmrSheets(validSessionId, { refetchWhileProcessing: true })
  const uploadMutation = useUploadOmrSheet(validSessionId, sessionQuery.data?.examId)

  const [statusFilter, setStatusFilter] = useState<OmrSheetStatus | ''>('')
  const [query, setQuery] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<OmrUploadQueueItem[]>([])

  uploadQueueRef.current = uploadQueue

  const session = sessionQuery.data
  const sheets = sheetsQuery.data ?? []
  const uploading = uploadQueue.some((item) => item.status === 'uploading' || item.status === 'queued')
  const sessionOpen = session?.status === 'OPEN'
  const canUpload = Boolean(sessionOpen && !uploading)

  useEffect(() => {
    return () => {
      revokePreviewUrls(uploadQueueRef.current)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sheets.filter((sheet) => {
      if (statusFilter && sheet.status !== statusFilter) return false
      if (!q) return true
      return (
        (sheet.studentId ?? '').toLowerCase().includes(q) ||
        (sheet.studentName ?? '').toLowerCase().includes(q) ||
        (sheet.examCode ?? '').toLowerCase().includes(q) ||
        String(sheet.submissionId).includes(q)
      )
    })
  }, [sheets, statusFilter, query])

  function openFilePicker() {
    fileRef.current?.click()
  }

  function patchQueueItem(id: string, patch: Partial<OmrUploadQueueItem>) {
    setUploadQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  async function processQueue(items: OmrUploadQueueItem[]) {
    if (processingRef.current) return
    processingRef.current = true

    for (const item of items) {
      if (item.status === 'error' || item.status === 'done') continue

      patchQueueItem(item.id, { status: 'uploading', progress: 0, error: undefined })
      try {
        await uploadMutation.mutateAsync({
          file: item.file,
          onUploadProgress: (percent) => {
            patchQueueItem(item.id, { progress: percent })
          },
        })
        patchQueueItem(item.id, { status: 'done', progress: 100 })
      } catch (error) {
        const resolved = parseOmrApiError(error, item.file.name)
        patchQueueItem(item.id, { status: 'error', error: resolved, progress: 0 })
      }
    }

    processingRef.current = false
  }

  function enqueueFiles(fileList: FileList | null) {
    if (!fileList?.length || session?.status !== 'OPEN' || uploading) return

    const nextItems: OmrUploadQueueItem[] = Array.from(fileList).map((file) => {
      const validationError = validateFile(file)
      return {
        id: makeUploadId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: validationError ? 'error' : 'queued',
        progress: 0,
        error: validationError ?? undefined,
      } satisfies OmrUploadQueueItem
    })

    if (!nextItems.length) return

    // Mỗi lần chọn ảnh = 1 batch mới, không cộng dồn log cũ.
    setUploadQueue((prev) => {
      revokePreviewUrls(prev)
      return nextItems
    })

    const toProcess = nextItems.filter((item) => item.status === 'queued')
    if (toProcess.length) {
      void processQueue(toProcess)
    }
  }

  function clearQueue() {
    if (uploading) return
    setUploadQueue((prev) => {
      revokePreviewUrls(prev)
      return []
    })
  }

  if (!validSessionId) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.teacher.omrUpload}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại
        </Link>
        <EmptyState title="Không tìm thấy phiên" description="Mã phiên không hợp lệ." />
      </div>
    )
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (sessionQuery.isError || !session) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.teacher.omrUpload}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại
        </Link>
        <ErrorState
          title="Không tải được phiên chấm"
          message={getApiErrorMessage(sessionQuery.error, 'Phiên chấm không tồn tại.')}
          action={
            <Button variant="secondary" onClick={() => void sessionQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          to={omrSessionsPath(session.examId, session.classroomId)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Phiên chấm
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{session.name}</h1>
          <span
            className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${EXAM_SESSION_STATUS_BADGE[session.status]}`}
          >
            {EXAM_SESSION_STATUS_LABEL[session.status]}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          {session.examTitle}
          {session.classroomName ? ` · ${session.classroomName}` : ''}
        </p>
      </div>

      <OmrUploadQueuePanel
        canUpload={canUpload}
        sessionOpen={Boolean(sessionOpen)}
        uploading={uploading}
        dragOver={dragOver}
        items={uploadQueue}
        fileRef={fileRef}
        accept={ACCEPT}
        onDragOver={setDragOver}
        onDropFiles={enqueueFiles}
        onPickFiles={enqueueFiles}
        onOpenPicker={openFilePicker}
        onClearQueue={clearQueue}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="MSSV, tên, mã đề..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Trạng thái
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target.value || '') as OmrSheetStatus | '')}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"
          >
            <option value="">Tất cả</option>
            {(Object.keys(OMR_SHEET_STATUS_LABEL) as OmrSheetStatus[]).map((key) => (
              <option key={key} value={key}>
                {OMR_SHEET_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sheetsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : sheetsQuery.isError ? (
        <ErrorState
          title="Không tải được danh sách phiếu"
          message={getApiErrorMessage(sheetsQuery.error)}
          action={
            <Button variant="secondary" onClick={() => void sheetsQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Chưa có phiếu" description="Tải ảnh phiếu trả lời để bắt đầu chấm." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <Table>
              <TableColGroup>
                <TableCol className="w-[10%]" />
                <TableCol className="w-[14%]" />
                <TableCol className="w-[18%]" />
                <TableCol className="w-[10%]" />
                <TableCol className="w-[14%]" />
                <TableCol className="w-[12%]" />
                <TableCol className="w-[12%]" />
                <TableCol className="w-[10%]" />
              </TableColGroup>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>MSSV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Mã đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Chấm lúc</TableHead>
                  <TableHead className="text-right"> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sheet) => (
                  <TableRow key={sheet.submissionId}>
                    <TableCell align="center" className="text-sm text-slate-600">
                      {sheet.submissionId}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {sheet.studentId ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-700">{sheet.studentName ?? '—'}</TableCell>
                    <TableCell align="center" className="text-slate-700">
                      {sheet.examCode ?? '—'}
                    </TableCell>
                    <TableCell align="center">
                      <span
                        className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${OMR_SHEET_STATUS_BADGE[sheet.status]}`}
                      >
                        {OMR_SHEET_STATUS_LABEL[sheet.status]}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="text-slate-800">
                      {formatOmrScore(sheet.score, sheet.maxScore)}
                    </TableCell>
                    <TableCell align="center" className="text-sm text-slate-600">
                      {formatOmrDateTime(sheet.gradedAt)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="secondary"
                        className="h-9 px-3"
                        onClick={() => navigate(omrSheetPath(sheet.submissionId))}
                      >
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 lg:hidden">
            {filtered.map((sheet) => (
              <li
                key={sheet.submissionId}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">
                      {sheet.studentName ?? sheet.studentId ?? `Phiếu #${sheet.submissionId}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      MSSV {sheet.studentId ?? '—'} · mã {sheet.examCode ?? '—'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-medium ${OMR_SHEET_STATUS_BADGE[sheet.status]}`}
                  >
                    {OMR_SHEET_STATUS_LABEL[sheet.status]}
                  </span>
                </div>
                <p className="mb-3 text-sm text-slate-600">
                  Điểm {formatOmrScore(sheet.score, sheet.maxScore)}
                </p>
                <Button className="w-full" onClick={() => navigate(omrSheetPath(sheet.submissionId))}>
                  Xem phiếu
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

    </div>
  )
}
