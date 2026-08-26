import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { EmptyState } from '../../../components/ui/EmptyState'
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
import { GradingFilterBar } from '../components/GradingFilterBar'
import { GradingStudentCard, GradingStudentTableRow } from '../components/GradingStudentRow'
import { GradingSummary } from '../components/GradingSummary'
import { SubmissionDetailDrawer } from '../components/SubmissionDetailDrawer'
import type { GradingStudentRow, SubmissionDetail } from '../types/grading.types'
import {
  MOCK_GRADING_CLASSROOMS,
  MOCK_GRADING_EXAMS,
  MOCK_GRADING_SHEET,
  MOCK_GRADING_SUBJECTS,
  MOCK_SUBMISSION_DETAILS,
  summarizeGradingStudents,
} from '../types/grading.types'

/** Skeleton UI — Chấm điểm GV (mock). API wiring: Loại B */
export function GradingPage() {
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classroomId, setClassroomId] = useState<number | ''>('')
  const [examId, setExamId] = useState<number | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSheetLoading, setIsSheetLoading] = useState(false)
  const [sheetError, setSheetError] = useState<string | null>(null)
  const [detail, setDetail] = useState<SubmissionDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const classroomsForSubject = useMemo(
    () =>
      subjectId === ''
        ? []
        : MOCK_GRADING_CLASSROOMS.filter((classroom) => classroom.subjectId === subjectId),
    [subjectId],
  )

  const examsForClassroom = useMemo(
    () =>
      classroomId === ''
        ? []
        : MOCK_GRADING_EXAMS.filter((exam) => exam.classroomIds.includes(classroomId)),
    [classroomId],
  )

  const selectedSubject = MOCK_GRADING_SUBJECTS.find((item) => item.id === subjectId)
  const selectedClassroom = classroomsForSubject.find((item) => item.id === classroomId)
  const selectedExam = examsForClassroom.find((item) => item.id === examId)

  const sheetReady = subjectId !== '' && classroomId !== '' && examId !== ''

  // Mock load sheet khi chọn đủ 3 filter
  useEffect(() => {
    if (!sheetReady) {
      setIsSheetLoading(false)
      setSheetError(null)
      return
    }

    setIsSheetLoading(true)
    setSheetError(null)
    const timer = window.setTimeout(() => {
      // Mock: exam 201 (CSDL) → empty students để demo empty
      if (examId === 201) {
        setIsSheetLoading(false)
        return
      }
      setIsSheetLoading(false)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [sheetReady, examId])

  const sheetStudents = useMemo(() => {
    if (!sheetReady || isSheetLoading) return []
    if (examId === 201) return []
    // Demo empty exams list already handled; for classroom without matching sheet use mock
    if (examId === 101 || examId === 102) {
      return MOCK_GRADING_SHEET.students.map((student) =>
        examId === 102 && student.status === 'IN_PROGRESS'
          ? { ...student, status: 'EXPIRED' as const, score: null, submitTime: null }
          : student,
      )
    }
    return MOCK_GRADING_SHEET.students
  }, [sheetReady, isSheetLoading, examId])

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
  const maxScore = selectedExam?.maxScore ?? MOCK_GRADING_SHEET.maxScore

  function handleSubjectChange(next: number | '') {
    setSubjectId(next)
    setClassroomId('')
    setExamId('')
    setSearchQuery('')
    setDetail(null)
    setSheetError(null)
  }

  function handleClassroomChange(next: number | '') {
    setClassroomId(next)
    setExamId('')
    setSearchQuery('')
    setDetail(null)
    setSheetError(null)
  }

  function handleExamChange(next: number | '') {
    setExamId(next)
    setSearchQuery('')
    setDetail(null)
    setSheetError(null)
  }

  function openSubmission(student: GradingStudentRow) {
    if (!student.submissionId) return
    setDetailLoading(true)
    window.setTimeout(() => {
      const found = MOCK_SUBMISSION_DETAILS[student.submissionId!]
      setDetail(
        found ?? {
          submissionId: student.submissionId!,
          examId: selectedExam?.id ?? 0,
          examTitle: selectedExam?.title ?? '',
          versionCode: student.versionCode ?? '—',
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          studentCode: student.studentCode,
          status: student.status,
          score: student.score,
          maxScore,
          correctQuestions: 0,
          totalQuestions: 0,
          startTime: student.startTime,
          submitTime: student.submitTime,
          details: [],
        },
      )
      setDetailLoading(false)
    }, 250)
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
          <span className={selectedExam ? 'font-medium text-slate-800' : ''}>
            {selectedExam?.title ?? 'Đề thi'}
          </span>
        </nav>
      </div>

      <GradingFilterBar
        subjects={MOCK_GRADING_SUBJECTS}
        classrooms={classroomsForSubject}
        exams={examsForClassroom}
        subjectId={subjectId}
        classroomId={classroomId}
        examId={examId}
        onSubjectChange={handleSubjectChange}
        onClassroomChange={handleClassroomChange}
        onExamChange={handleExamChange}
      />

      {!sheetReady ? (
        <EmptyState
          title="Chọn môn, lớp và đề thi"
          description="Bảng chấm điểm chỉ hiện khi đã chọn đủ ba bộ lọc phía trên."
        />
      ) : null}

      {sheetReady && examsForClassroom.length === 0 ? (
        <EmptyState
          title="Lớp chưa có đề thi"
          description="Chưa có đề nào được giao cho lớp này. Tạo hoặc giao đề ở mục Quản lý bài thi."
        />
      ) : null}

      {sheetReady && selectedExam ? (
        <>
          {sheetError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{sheetError}</p>
          ) : null}

          {isSheetLoading ? <Spinner label="Đang tải bảng chấm điểm..." /> : null}

          {!isSheetLoading && sheetStudents.length === 0 ? (
            <EmptyState
              title="Lớp chưa có sinh viên"
              description="Không có sinh viên nào trong bảng grading của đề này."
            />
          ) : null}

          {!isSheetLoading && sheetStudents.length > 0 ? (
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
                <EmptyState
                  title="Không tìm thấy sinh viên"
                  description="Thử đổi từ khóa tìm kiếm."
                />
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

      {detailLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <Spinner label="Đang tải bài nộp..." />
        </div>
      ) : null}

      {detail ? <SubmissionDetailDrawer detail={detail} onClose={() => setDetail(null)} /> : null}
    </section>
  )
}
