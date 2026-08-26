import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { ROUTES } from '../../../routes/routes.config'
import { useClassrooms } from '../../classrooms/hooks/useClassrooms'
import { useExams } from '../../exams/hooks/useExams'
import { useSubjects } from '../../subjects/hooks/useSubjects'
import { ExamStatsFilterBar } from '../components/ExamStatsFilterBar'
import { ExamStatsSummary } from '../components/ExamStatsSummary'
import { QuestionStatsTable } from '../components/QuestionStatsTable'
import { ScoreDistributionChart } from '../components/ScoreDistributionChart'
import { useExamStats } from '../hooks/useExamStats'

export function ExamStatsPage() {
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classroomId, setClassroomId] = useState<number | ''>('')
  const [examId, setExamId] = useState<number | ''>('')
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null)

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
  const statsQuery = useExamStats(
    typeof examId === 'number' ? examId : undefined,
    typeof classroomId === 'number' ? classroomId : undefined,
  )

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
        maxScore: item.maxScore,
        classroomIds: item.classroomIds ?? [],
      })),
    [examsQuery.data],
  )

  const selectedSubject = subjects.find((item) => item.id === subjectId)
  const selectedClassroom = classrooms.find((item) => item.id === classroomId)
  const selectedExam = exams.find((item) => item.id === examId)

  const filtersReady = subjectId !== '' && classroomId !== '' && examId !== ''
  const classroomSelected = classroomId !== ''
  const examsEmpty =
    classroomSelected && !examsQuery.isLoading && !examsQuery.isError && exams.length === 0

  const stats = statsQuery.data ?? null

  function handleSubjectChange(next: number | '') {
    setSubjectId(next)
    setClassroomId('')
    setExamId('')
    setHighlightedQuestionId(null)
  }

  function handleClassroomChange(next: number | '') {
    setClassroomId(next)
    setExamId('')
    setHighlightedQuestionId(null)
  }

  function handleExamChange(next: number | '') {
    setExamId(next)
    setHighlightedQuestionId(null)
  }

  function handleHighlight(questionId: number) {
    setHighlightedQuestionId((current) => (current === questionId ? null : questionId))
  }

  const subtitleParts = [
    stats?.examTitle ?? selectedExam?.title,
    stats?.classroomName ?? selectedClassroom?.className,
    stats || selectedExam ? `Thang điểm ${stats?.maxScore ?? selectedExam?.maxScore}` : null,
  ].filter(Boolean)

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Thống kê</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Thống kê bài thi</h1>
          <p className="mt-1 text-sm text-slate-500">
            {subtitleParts.length > 0
              ? subtitleParts.join(' · ')
              : 'Chọn môn → lớp → đề để xem tỉ lệ nộp, điểm và độ khó từng câu.'}
          </p>

          <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <span className={selectedSubject ? 'font-medium text-slate-800' : ''}>
              {selectedSubject?.subjectName ?? 'Môn học'}
            </span>
            <span className="text-slate-300">/</span>
            <span className={selectedClassroom ? 'font-medium text-slate-800' : ''}>
              {selectedClassroom?.className ?? 'Lớp học'}
            </span>
            <span className="text-slate-300">/</span>
            <span className={selectedExam || stats ? 'font-medium text-slate-800' : ''}>
              {selectedExam?.title ?? stats?.examTitle ?? 'Đề thi'}
            </span>
          </nav>
        </div>

        {filtersReady ? (
          <Link
            to={ROUTES.teacher.grading}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Xem bảng chấm điểm
          </Link>
        ) : null}
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
        <ExamStatsFilterBar
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

      {!filtersReady && !examsEmpty ? (
        <EmptyState
          title="Chọn môn, lớp và đề thi"
          description="Thống kê chỉ hiện khi đã chọn đủ ba bộ lọc. Lớp là bắt buộc (cùng luồng với Chấm điểm)."
        />
      ) : null}

      {examsEmpty ? (
        <EmptyState
          title="Lớp chưa có đề thi"
          description="Chưa có đề nào được giao cho lớp này. Tạo hoặc giao đề ở mục Quản lý bài thi."
        />
      ) : null}

      {filtersReady ? (
        <>
          {statsQuery.isError ? (
            <ErrorState
              title="Không tải được thống kê"
              message={getApiErrorMessage(statsQuery.error, 'Không thể tải thống kê bài thi')}
              action={
                <button
                  type="button"
                  onClick={() => void statsQuery.refetch()}
                  className="h-9 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                >
                  Thử lại
                </button>
              }
            />
          ) : null}

          {statsQuery.isLoading ? <Spinner label="Đang tải thống kê..." /> : null}

          {!statsQuery.isLoading && !statsQuery.isError && stats && stats.totalStudents === 0 ? (
            <EmptyState
              title="Lớp chưa có sinh viên"
              description="Đề chưa có roster sinh viên cho lớp này, hoặc lớp chưa được giao đề."
            />
          ) : null}

          {!statsQuery.isLoading && !statsQuery.isError && stats && stats.totalStudents > 0 ? (
            <div className="space-y-5">
              <ExamStatsSummary stats={stats} />
              <ScoreDistributionChart
                buckets={stats.scoreDistribution}
                submittedCount={stats.submittedCount}
              />
              <QuestionStatsTable
                items={stats.questionStats}
                highlightedQuestionId={highlightedQuestionId}
                onHighlight={handleHighlight}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
