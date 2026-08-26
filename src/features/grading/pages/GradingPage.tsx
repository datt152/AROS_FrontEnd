import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import {
  Table,
  TableBody,
  TableCol,
  TableColGroup,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/Table'
import { getApiErrorMessage } from '../../../lib/apiError'
import { useClassrooms } from '../../classrooms/hooks/useClassrooms'
import { useExams } from '../../exams/hooks/useExams'
import { useSubjects } from '../../subjects/hooks/useSubjects'
import { GradingFilterBar } from '../components/GradingFilterBar'
import { GradingStudentCard, GradingStudentTableRow } from '../components/GradingStudentRow'
import { GradingSummary } from '../components/GradingSummary'
import { SubmissionDetailDrawer } from '../components/SubmissionDetailDrawer'
import { useExamGrading, useSubmissionDetail } from '../hooks/useGrading'
import type { GradingStudentRow } from '../types/grading.types'
import { summarizeGradingStudents } from '../types/grading.types'

export function GradingPage() {
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classroomId, setClassroomId] = useState<number | ''>('')
  const [examId, setExamId] = useState<number | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | undefined>(undefined)

  const subjectsQuery = useSubjects()
  const classroomsQuery = useClassrooms(typeof subjectId === 'number' ? subjectId : undefined, {
    enabled: subjectId !== '',
  })
  const examsQuery = useExams(
    {
      page: 0,
      size: 50,
      classroomId: typeof classroomId === 'number' ? classroomId : undefined,
    },
    { enabled: classroomId !== '' },
  )
  const sheetQuery = useExamGrading(
    typeof examId === 'number' ? examId : undefined,
    typeof classroomId === 'number' ? classroomId : undefined,
  )
  const detailQuery = useSubmissionDetail(selectedSubmissionId)

  const subjects = useMemo(
    () => (subjectsQuery.data ?? []).map((item) => ({ id: item.id, subjectName: item.subjectName })),
    [subjectsQuery.data],
  )

  const classrooms = useMemo(
    () =>
      (classroomsQuery.data ?? []).map((item) => ({
        id: item.id,
        className: item.className,
        subjectId: item.subjectId,
      })),
    [classroomsQuery.data],
  )

  const exams = useMemo(
    () =>
      (examsQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        startAt: item.startAt,
        endAt: item.endAt,
        maxScore: item.maxScore,
        classroomIds: item.classroomIds ?? [],
      })),
    [examsQuery.data],
  )

  const selectedSubject = subjects.find((item) => item.id === subjectId)
  const selectedClassroom = classrooms.find((item) => item.id === classroomId)
  const selectedExam = exams.find((item) => item.id === examId)

  const sheetReady = subjectId !== '' && classroomId !== '' && examId !== ''
  const classroomSelected = classroomId !== ''
  const examsEmpty =
    classroomSelected && !examsQuery.isLoading && !examsQuery.isError && exams.length === 0

  const sheetStudents = sheetQuery.data?.students ?? []
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = [...sheetStudents].sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
    if (!q) return list
    return list.filter(
      (student) =>
        student.fullName.toLowerCase().includes(q) ||
        student.studentCode.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q),
    )
  }, [sheetStudents, searchQuery])

  const summary = useMemo(() => summarizeGradingStudents(sheetStudents), [sheetStudents])
  const maxScore = sheetQuery.data?.maxScore ?? selectedExam?.maxScore ?? 0

  function handleSubjectChange(next: number | '') {
    setSubjectId(next)
    setClassroomId('')
    setExamId('')
    setSearchQuery('')
    setSelectedSubmissionId(undefined)
  }

  function handleClassroomChange(next: number | '') {
    setClassroomId(next)
    setExamId('')
    setSearchQuery('')
    setSelectedSubmissionId(undefined)
  }

  function handleExamChange(next: number | '') {
    setExamId(next)
    setSearchQuery('')
    setSelectedSubmissionId(undefined)
  }

  function openSubmission(student: GradingStudentRow) {
    if (!student.submissionId) return
    setSelectedSubmissionId(student.submissionId)
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Chấm điểm</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Chấm điểm</h1>
        <p className="mt-1 text-sm text-slate-500">Chọn môn → lớp → đề để xem trạng thái nộp bài của sinh viên.</p>

        <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <span className={selectedSubject ? 'font-medium text-slate-800' : ''}>
            {selectedSubject?.subjectName ?? 'Môn học'}
          </span>
          <span className="text-slate-300">/</span>
          <span className={selectedClassroom ? 'font-medium text-slate-800' : ''}>
            {selectedClassroom?.className ?? 'Lớp học'}
          </span>
          <span className="text-slate-300">/</span>
          <span className={selectedExam || sheetQuery.data ? 'font-medium text-slate-800' : ''}>
            {selectedExam?.title ?? sheetQuery.data?.examTitle ?? 'Đề thi'}
          </span>
        </nav>
      </div>

      {subjectsQuery.isLoading ? <Spinner label="Đang tải môn học..." /> : null}

      {subjectsQuery.isError ? (
        <ErrorState
          title="Không tải được môn học"
          message={getApiErrorMessage(subjectsQuery.error, 'Không thể tải danh sách môn học')}
          action={
            <button
              type="button"
              onClick={() => void subjectsQuery.refetch()}
              className="h-9 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          }
        />
      ) : null}

      {!subjectsQuery.isLoading && !subjectsQuery.isError ? (
        <GradingFilterBar
          subjects={subjects}
          classrooms={classrooms}
          exams={exams}
          subjectId={subjectId}
          classroomId={classroomId}
          examId={examId}
          onSubjectChange={handleSubjectChange}
          onClassroomChange={handleClassroomChange}
          onExamChange={handleExamChange}
        />
      ) : null}

      {subjectId !== '' && classroomsQuery.isLoading ? <Spinner label="Đang tải lớp học..." /> : null}

      {subjectId !== '' && classroomsQuery.isError ? (
        <ErrorState
          title="Không tải được lớp học"
          message={getApiErrorMessage(classroomsQuery.error, 'Không thể tải danh sách lớp')}
          action={
            <button
              type="button"
              onClick={() => void classroomsQuery.refetch()}
              className="h-9 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          }
        />
      ) : null}

      {classroomSelected && examsQuery.isLoading ? <Spinner label="Đang tải đề thi..." /> : null}

      {classroomSelected && examsQuery.isError ? (
        <ErrorState
          title="Không tải được đề thi"
          message={getApiErrorMessage(examsQuery.error, 'Không thể tải danh sách đề theo lớp')}
          action={
            <button
              type="button"
              onClick={() => void examsQuery.refetch()}
              className="h-9 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          }
        />
      ) : null}

      {!sheetReady && !examsEmpty ? (
        <EmptyState
          title="Chọn môn, lớp và đề thi"
          description="Bảng chấm điểm chỉ hiện khi đã chọn đủ ba bộ lọc phía trên."
        />
      ) : null}

      {examsEmpty ? (
        <EmptyState
          title="Lớp chưa có đề thi"
          description="Chưa có đề nào được giao cho lớp này. Tạo hoặc giao đề ở mục Quản lý bài thi."
        />
      ) : null}

      {sheetReady ? (
        <>
          {sheetQuery.isError ? (
            <ErrorState
              title="Không tải được bảng chấm điểm"
              message={getApiErrorMessage(sheetQuery.error, 'Không thể tải bảng grading')}
              action={
                <button
                  type="button"
                  onClick={() => void sheetQuery.refetch()}
                  className="h-9 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                >
                  Thử lại
                </button>
              }
            />
          ) : null}

          {sheetQuery.isLoading ? <Spinner label="Đang tải bảng chấm điểm..." /> : null}

          {!sheetQuery.isLoading && !sheetQuery.isError && sheetStudents.length === 0 ? (
            <EmptyState
              title="Lớp chưa có sinh viên"
              description="Không có sinh viên nào trong bảng grading của đề này."
            />
          ) : null}

          {!sheetQuery.isLoading && !sheetQuery.isError && sheetStudents.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <GradingSummary counts={summary} />
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm theo tên hoặc mã SV..."
                    className="pl-9"
                  />
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <EmptyState title="Không tìm thấy sinh viên" description="Thử đổi từ khóa tìm kiếm." />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="divide-y divide-slate-200 md:hidden">
                    {filteredStudents.map((student, index) => (
                      <GradingStudentCard
                        key={student.studentId}
                        index={index}
                        student={student}
                        maxScore={maxScore}
                        onViewSubmission={openSubmission}
                      />
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableColGroup>
                        <TableCol width="3.5rem" />
                        <TableCol width="6rem" />
                        <TableCol />
                        <TableCol width="18%" />
                        <TableCol width="9rem" />
                        <TableCol width="5rem" />
                        <TableCol width="5.5rem" />
                        <TableCol width="9rem" />
                        <TableCol width="7.5rem" />
                      </TableColGroup>
                      <TableHeader>
                        <TableRow className="border-b-0 hover:bg-transparent">
                          <TableHead>STT</TableHead>
                          <TableHead align="left">Mã SV</TableHead>
                          <TableHead align="left">Họ tên</TableHead>
                          <TableHead align="left">Email</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Mã đề</TableHead>
                          <TableHead>Điểm</TableHead>
                          <TableHead>Nộp lúc</TableHead>
                          <TableHead>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student, index) => (
                          <GradingStudentTableRow
                            key={student.studentId}
                            index={index}
                            student={student}
                            maxScore={maxScore}
                            onViewSubmission={openSubmission}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : null}

      {selectedSubmissionId !== undefined && detailQuery.isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <Spinner label="Đang tải bài nộp..." />
        </div>
      ) : null}

      {selectedSubmissionId !== undefined && detailQuery.isError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <ErrorState
              title="Không tải được bài nộp"
              message={getApiErrorMessage(detailQuery.error, 'Không thể tải chi tiết bài nộp')}
              action={
                <button
                  type="button"
                  onClick={() => void detailQuery.refetch()}
                  className="h-9 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                >
                  Thử lại
                </button>
              }
            />
            <button
              type="button"
              onClick={() => setSelectedSubmissionId(undefined)}
              className="mt-3 h-10 w-full rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}

      {detailQuery.data ? (
        <SubmissionDetailDrawer detail={detailQuery.data} onClose={() => setSelectedSubmissionId(undefined)} />
      ) : null}
    </section>
  )
}
