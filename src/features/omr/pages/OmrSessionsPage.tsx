import { ArrowLeft, Lock, Plus, Unlock } from 'lucide-react'
import { useMemo, useState } from 'react'
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
  omrSessionPath,
  ROUTES,
} from '../../../routes/routes.config'
import { getMockOmrExam, getMockSessionsByExam } from '../lib/omr.mock'
import type { ExamSessionItem, ExamSessionStatus } from '../types/omr.types'
import {
  EXAM_SESSION_STATUS_BADGE,
  EXAM_SESSION_STATUS_LABEL,
  formatOmrDateTime,
} from '../types/omr.types'

export function OmrSessionsPage() {
  const { examId: examIdParam } = useParams()
  const examId = Number(examIdParam)
  const navigate = useNavigate()
  const exam = getMockOmrExam(examId)

  const [sessions, setSessions] = useState<ExamSessionItem[]>(() =>
    Number.isFinite(examId) ? getMockSessionsByExam(examId) : [],
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')

  const title = exam?.title ?? 'Đề OMR'

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sessions],
  )

  function handleCreate() {
    const name = sessionName.trim()
    if (!name) return
    const next: ExamSessionItem = {
      id: Date.now(),
      examId,
      examTitle: title,
      name,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      sheetCount: 0,
    }
    setSessions((prev) => [next, ...prev])
    setSessionName('')
    setCreateOpen(false)
  }

  function patchStatus(id: number, status: ExamSessionStatus) {
    setSessions((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  if (!Number.isFinite(examId)) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.teacher.omrUpload}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại
        </Link>
        <EmptyState title="Không tìm thấy đề" description="Mã đề không hợp lệ." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            to={ROUTES.teacher.omrUpload}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Đề OMR
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">
            {exam
              ? `${exam.subjectName} · ${exam.totalQuestions} câu · mã đề ${
                  exam.versionCodes.length ? exam.versionCodes.join(', ') : '—'
                }`
              : `Đề #${examId} (mock — gắn API sau sẽ lấy thông tin thật)`}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Tạo phiên chấm
        </Button>
      </div>

      {createOpen ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-800">Phiên chấm mới</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 space-y-1.5">
              <span className="text-sm text-slate-600">Tên phiên</span>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Vd: Ca sáng — lớp SE17"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                }}
              />
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button disabled={!sessionName.trim()} onClick={handleCreate}>
                Tạo
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState
          title="Chưa có phiên chấm"
          description="Tạo phiên để bắt đầu tải phiếu trả lời OMR."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <Table>
              <TableColGroup>
                <TableCol className="w-[32%]" />
                <TableCol className="w-[16%]" />
                <TableCol className="w-[12%]" />
                <TableCol className="w-[20%]" />
                <TableCol className="w-[20%]" />
              </TableColGroup>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên phiên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Phiếu</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium text-slate-900">{session.name}</TableCell>
                    <TableCell align="center">
                      <span
                        className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${EXAM_SESSION_STATUS_BADGE[session.status]}`}
                      >
                        {EXAM_SESSION_STATUS_LABEL[session.status]}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="text-slate-700">
                      {session.sheetCount}
                    </TableCell>
                    <TableCell align="center" className="text-sm text-slate-600">
                      {formatOmrDateTime(session.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="secondary"
                          className="h-9 px-3"
                          onClick={() => navigate(omrSessionPath(session.id))}
                        >
                          Mở
                        </Button>
                        {session.status === 'OPEN' ? (
                          <Button
                            variant="ghost"
                            className="h-9 px-3"
                            onClick={() => patchStatus(session.id, 'CLOSED')}
                            title="Khóa phiên"
                          >
                            <Lock className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                        ) : null}
                        {session.status === 'CLOSED' ? (
                          <Button
                            variant="ghost"
                            className="h-9 px-3"
                            onClick={() => patchStatus(session.id, 'OPEN')}
                            title="Mở lại"
                          >
                            <Unlock className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                        ) : null}
                        {session.status === 'CLOSED' ? (
                          <Button
                            variant="ghost"
                            className="h-9 px-3 text-blue-700"
                            onClick={() => patchStatus(session.id, 'GRADED')}
                          >
                            Kết thúc
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {sorted.map((session) => (
              <li key={session.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">{session.name}</p>
                  <span
                    className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-medium ${EXAM_SESSION_STATUS_BADGE[session.status]}`}
                  >
                    {EXAM_SESSION_STATUS_LABEL[session.status]}
                  </span>
                </div>
                <p className="mb-3 text-sm text-slate-500">
                  {session.sheetCount} phiếu · {formatOmrDateTime(session.createdAt)}
                </p>
                <Button className="w-full" onClick={() => navigate(omrSessionPath(session.id))}>
                  Mở phiên
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
