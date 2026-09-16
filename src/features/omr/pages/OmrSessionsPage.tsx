import { ArrowLeft, Lock, Plus, Unlock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

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
import { omrSessionPath, ROUTES } from '../../../routes/routes.config'
import { useExam, useExamClassrooms, useExamVersions } from '../../exams/hooks/useExams'
import { OmrClassroomCard } from '../components/OmrClassroomCard'
import {
  useCreateExamSession,
  useExamSessions,
  useUpdateExamSessionStatus,
} from '../hooks/useOmr'
import type { ExamSessionStatus } from '../types/omr.types'
import {
  EXAM_SESSION_STATUS_BADGE,
  EXAM_SESSION_STATUS_LABEL,
  formatOmrDateTime,
} from '../types/omr.types'

export function OmrSessionsPage() {
  const { examId: examIdParam } = useParams()
  const examId = Number(examIdParam)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const validExamId = Number.isFinite(examId) && examId > 0 ? examId : undefined

  const examQuery = useExam(validExamId)
  const versionsQuery = useExamVersions(validExamId)
  const classroomsQuery = useExamClassrooms(validExamId)

  const classroomIdFromUrl = Number(searchParams.get('classroomId'))
  const selectedClassroomId =
    Number.isFinite(classroomIdFromUrl) && classroomIdFromUrl > 0 ? classroomIdFromUrl : undefined

  const sessionsQuery = useExamSessions(validExamId, selectedClassroomId)
  const createMutation = useCreateExamSession(validExamId)
  const statusMutation = useUpdateExamSessionStatus(validExamId)

  const [createOpen, setCreateOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const exam = examQuery.data
  const classrooms = classroomsQuery.data ?? []
  const versionCodes = versionsQuery.data ?? exam?.versionCodes ?? []
  const title = exam?.title ?? (validExamId ? `Đề #${validExamId}` : 'Đề OMR')
  const selectedClassroom = classrooms.find((item) => item.id === selectedClassroomId)
  const examSubjectName = exam?.subjectName?.trim() || null

  const sorted = useMemo(
    () => [...(sessionsQuery.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sessionsQuery.data],
  )

  function selectClassroom(classroomId: number) {
    setCreateOpen(false)
    setActionError(null)
    setSearchParams({ classroomId: String(classroomId) })
  }

  function clearClassroom() {
    setCreateOpen(false)
    setActionError(null)
    setSearchParams({})
  }

  async function handleCreate() {
    if (!validExamId || !selectedClassroomId) return
    const name = sessionName.trim()
    if (!name) return
    setActionError(null)
    try {
      await createMutation.mutateAsync({
        examId: validExamId,
        classroomId: selectedClassroomId,
        name,
      })
      setSessionName('')
      setCreateOpen(false)
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Không tạo được phiên chấm'))
    }
  }

  async function patchStatus(sessionId: number, status: ExamSessionStatus) {
    setActionError(null)
    try {
      await statusMutation.mutateAsync({ sessionId, status })
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Không cập nhật được trạng thái phiên'))
    }
  }

  if (!validExamId) {
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
              ? `${exam.subjectName ?? '—'} · ${exam.totalQuestions ?? 0} câu · mã đề ${
                  versionCodes.length ? versionCodes.join(', ') : '—'
                }`
              : examQuery.isLoading
                ? 'Đang tải thông tin đề...'
                : `Đề #${examId}`}
          </p>
        </div>
        {selectedClassroomId ? (
          <Button onClick={() => setCreateOpen(true)} disabled={createMutation.isPending}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Tạo phiên chấm
          </Button>
        ) : null}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {selectedClassroomId ? 'Lớp đang chấm' : 'Chọn lớp để chấm'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Điểm OMR gắn theo lớp — quét lớp A không ghi điểm lớp B.
            </p>
          </div>
          {selectedClassroomId ? (
            <Button type="button" variant="secondary" className="h-9" onClick={clearClassroom}>
              Đổi lớp
            </Button>
          ) : null}
        </div>

        {classroomsQuery.isLoading ? (
          <Spinner label="Đang tải lớp đã giao..." />
        ) : classroomsQuery.isError ? (
          <ErrorState
            title="Không tải được danh sách lớp"
            message={getApiErrorMessage(classroomsQuery.error)}
            action={
              <Button variant="secondary" onClick={() => void classroomsQuery.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : classrooms.length === 0 ? (
          <EmptyState
            title="Đề chưa giao lớp"
            description="Giao đề cho ít nhất một lớp trước khi tạo phiên chấm OMR."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(selectedClassroomId
              ? classrooms.filter((item) => item.id === selectedClassroomId)
              : classrooms
            ).map((classroom) => (
              <li key={classroom.id}>
                <OmrClassroomCard
                  classroom={{
                    id: classroom.id,
                    className: classroom.className,
                    subjectName: classroom.subjectName || examSubjectName,
                  }}
                  selected={classroom.id === selectedClassroomId}
                  onSelect={selectClassroom}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

      {!selectedClassroomId ? (
        classrooms.length > 0 ? (
          <EmptyState
            title="Chọn một lớp"
            description="Bấm vào card lớp để xem và tạo phiên chấm OMR."
          />
        ) : null
      ) : (
        <>
          {createOpen ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-medium text-slate-800">Phiên chấm mới</p>
              <p className="mb-3 text-xs text-slate-500">
                Lớp: <span className="font-medium text-slate-700">{selectedClassroom?.className}</span>
                {selectedClassroom?.subjectName || examSubjectName
                  ? ` · ${selectedClassroom?.subjectName || examSubjectName}`
                  : ''}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1 space-y-1.5">
                  <span className="text-sm text-slate-600">Tên phiên</span>
                  <Input
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Vd: Chấm buổi sáng"
                    disabled={createMutation.isPending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleCreate()
                    }}
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setCreateOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    disabled={!sessionName.trim() || createMutation.isPending}
                    onClick={() => void handleCreate()}
                  >
                    {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {sessionsQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : sessionsQuery.isError ? (
            <ErrorState
              title="Không tải được phiên chấm"
              message={getApiErrorMessage(sessionsQuery.error)}
              action={
                <Button variant="secondary" onClick={() => void sessionsQuery.refetch()}>
                  Thử lại
                </Button>
              }
            />
          ) : sorted.length === 0 ? (
            <EmptyState
              title="Chưa có phiên chấm"
              description={`Tạo phiên cho lớp ${selectedClassroom?.className ?? ''} để bắt đầu tải phiếu OMR.`}
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <Table>
                  <TableColGroup>
                    <TableCol className="w-[28%]" />
                    <TableCol className="w-[18%]" />
                    <TableCol className="w-[14%]" />
                    <TableCol className="w-[10%]" />
                    <TableCol className="w-[14%]" />
                    <TableCol className="w-[16%]" />
                  </TableColGroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên phiên</TableHead>
                      <TableHead>Lớp</TableHead>
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
                        <TableCell className="text-slate-700">
                          {session.classroomName || selectedClassroom?.className || '—'}
                        </TableCell>
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
                                disabled={statusMutation.isPending}
                                onClick={() => void patchStatus(session.id, 'CLOSED')}
                                title="Khóa phiên"
                              >
                                <Lock className="h-4 w-4" strokeWidth={1.75} />
                              </Button>
                            ) : null}
                            {session.status === 'CLOSED' ? (
                              <Button
                                variant="ghost"
                                className="h-9 px-3"
                                disabled={statusMutation.isPending}
                                onClick={() => void patchStatus(session.id, 'OPEN')}
                                title="Mở lại"
                              >
                                <Unlock className="h-4 w-4" strokeWidth={1.75} />
                              </Button>
                            ) : null}
                            {session.status === 'CLOSED' ? (
                              <Button
                                variant="ghost"
                                className="h-9 px-3 text-blue-700"
                                disabled={statusMutation.isPending}
                                onClick={() => void patchStatus(session.id, 'GRADED')}
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
                  <li
                    key={session.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{session.name}</p>
                        <p className="text-sm text-slate-500">
                          {session.classroomName || selectedClassroom?.className || '—'}
                        </p>
                      </div>
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
        </>
      )}
    </div>
  )
}
