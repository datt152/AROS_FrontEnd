import { ArrowLeft, Search, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
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
import {
  omrSessionsPath,
  omrSheetPath,
  ROUTES,
} from '../../../routes/routes.config'
import { getMockSession, getMockSheetsBySession } from '../lib/omr.mock'
import type { OmrSheetItem, OmrSheetStatus } from '../types/omr.types'
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

export function OmrSessionWorkspacePage() {
  const { sessionId: sessionIdParam } = useParams()
  const sessionId = Number(sessionIdParam)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const session = getMockSession(sessionId)
  const [sheets, setSheets] = useState<OmrSheetItem[]>(() =>
    Number.isFinite(sessionId) ? getMockSheetsBySession(sessionId) : [],
  )
  const [statusFilter, setStatusFilter] = useState<OmrSheetStatus | ''>('')
  const [query, setQuery] = useState('')
  const [uploadNote, setUploadNote] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const canUpload = session?.status === 'OPEN'

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

  function handleFiles(fileList: FileList | null) {
    if (!canUpload || !fileList?.length || !session) return
    const accepted: File[] = []
    const rejected: string[] = []
    Array.from(fileList).forEach((file) => {
      const okType = /image\/(jpeg|png)/i.test(file.type) || /\.(jpe?g|png)$/i.test(file.name)
      if (!okType) {
        rejected.push(`${file.name}: chỉ JPG/PNG`)
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        rejected.push(`${file.name}: vượt 10MB`)
        return
      }
      accepted.push(file)
    })

    if (accepted.length) {
      const nextSheets: OmrSheetItem[] = accepted.map((file, index) => ({
        submissionId: Date.now() + index,
        examSessionId: sessionId,
        examId: session.examId,
        status: 'PROCESSING',
        studentId: null,
        matchedStudentId: null,
        studentName: null,
        examCode: null,
        score: null,
        maxScore: 10,
        warpedUrl: null,
        originalImageUrl: URL.createObjectURL(file),
        needReview: [],
        answers: [],
        gradedAt: null,
      }))
      setSheets((prev) => [...nextSheets, ...prev])
      setUploadNote(`Đã thêm ${accepted.length} phiếu (mock — chờ API xử lý).`)
    }
    if (rejected.length) {
      setUploadNote((prev) => [prev, ...rejected].filter(Boolean).join(' · '))
    }
  }

  if (!Number.isFinite(sessionId) || !session) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.teacher.omrUpload}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại
        </Link>
        <EmptyState title="Không tìm thấy phiên" description="Phiên chấm không tồn tại trong dữ liệu mock." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          to={omrSessionsPath(session.examId)}
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
        <p className="text-sm text-slate-500">{session.examTitle}</p>
      </div>

      <section
        className={`rounded-2xl border border-dashed p-6 transition ${
          dragOver ? 'border-blue-400 bg-blue-50/60' : 'border-slate-300 bg-white'
        } ${canUpload ? '' : 'opacity-70'}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (canUpload) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Upload className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium text-slate-800">
            {canUpload ? 'Kéo thả ảnh phiếu trả lời vào đây' : 'Phiên đã khóa — không tải thêm phiếu'}
          </p>
          <p className="mt-1 text-xs text-slate-500">JPG hoặc PNG, tối đa 10MB mỗi file. Có thể chọn nhiều ảnh.</p>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            disabled={!canUpload}
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <Button
            className="mt-4"
            variant={canUpload ? 'primary' : 'secondary'}
            disabled={!canUpload}
            onClick={() => fileRef.current?.click()}
          >
            Chọn ảnh
          </Button>
          {uploadNote ? <p className="mt-3 max-w-lg text-xs text-slate-600">{uploadNote}</p> : null}
        </div>
      </section>

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

      {filtered.length === 0 ? (
        <EmptyState title="Chưa có phiếu" description="Tải ảnh phiếu trả lời để bắt đầu chấm (mock)." />
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
              <li key={sheet.submissionId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
