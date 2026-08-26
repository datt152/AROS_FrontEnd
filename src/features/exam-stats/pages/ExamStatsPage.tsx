import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { ROUTES } from '../../../routes/routes.config'
import { ExamStatsFilterBar } from '../components/ExamStatsFilterBar'
import { ExamStatsSummary } from '../components/ExamStatsSummary'
import { QuestionStatsTable } from '../components/QuestionStatsTable'
import { ScoreDistributionChart } from '../components/ScoreDistributionChart'
import type { ExamStats } from '../types/examStats.types'
import {
  MOCK_STATS_CLASSROOMS,
  MOCK_STATS_EXAMS,
  MOCK_STATS_SUBJECTS,
  getMockExamStats,
} from '../types/examStats.types'

/** Skeleton UI — Thống kê bài thi (mock). API wiring: Loại B */
export function ExamStatsPage() {
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classroomId, setClassroomId] = useState<number | ''>('')
  const [examId, setExamId] = useState<number | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [stats, setStats] = useState<ExamStats | null>(null)
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null)

  const classrooms = useMemo(
    () =>
      subjectId === ''
        ? []
        : MOCK_STATS_CLASSROOMS.filter((classroom) => classroom.subjectId === subjectId),
    [subjectId],
  )

  const exams = useMemo(
    () =>
      classroomId === ''
        ? []
        : MOCK_STATS_EXAMS.filter((exam) => exam.classroomIds.includes(classroomId)),
    [classroomId],
  )

  const selectedSubject = MOCK_STATS_SUBJECTS.find((item) => item.id === subjectId)
  const selectedClassroom = classrooms.find((item) => item.id === classroomId)
  const selectedExam = exams.find((item) => item.id === examId)

  const filtersReady = subjectId !== '' && classroomId !== '' && examId !== ''

  useEffect(() => {
    if (!filtersReady || typeof examId !== 'number' || typeof classroomId !== 'number') {
      setIsLoading(false)
      setLoadError(null)
      setStats(null)
      return
    }

    setIsLoading(true)
    setLoadError(null)
    setStats(null)
    setHighlightedQuestionId(null)

    const timer = window.setTimeout(() => {
      const next = getMockExamStats(examId, classroomId)
      if (!next) {
        setLoadError('Không tải được thống kê cho đề này. Vui lòng thử lại.')
        setIsLoading(false)
        return
      }
      setStats(next)
      setIsLoading(false)
    }, 450)

    return () => window.clearTimeout(timer)
  }, [filtersReady, examId, classroomId])

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

      <ExamStatsFilterBar
        subjects={MOCK_STATS_SUBJECTS}
        classrooms={classrooms}
        exams={exams}
        subjectId={subjectId}
        classroomId={classroomId}
        examId={examId}
        onSubjectChange={handleSubjectChange}
        onClassroomChange={handleClassroomChange}
        onExamChange={handleExamChange}
      />

      {!filtersReady && !(classroomId !== '' && exams.length === 0) ? (
        <EmptyState
          title="Chọn môn, lớp và đề thi"
          description="Thống kê chỉ hiện khi đã chọn đủ ba bộ lọc. Lớp là bắt buộc (cùng luồng với Chấm điểm)."
        />
      ) : null}

      {classroomId !== '' && exams.length === 0 ? (
        <EmptyState
          title="Lớp chưa có đề thi"
          description="Chưa có đề nào được giao cho lớp này. Tạo hoặc giao đề ở mục Quản lý bài thi."
        />
      ) : null}

      {filtersReady ? (
        <>
          {loadError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{loadError}</p>
          ) : null}

          {isLoading ? <Spinner label="Đang tải thống kê..." /> : null}

          {!isLoading && !loadError && stats && stats.totalStudents === 0 ? (
            <EmptyState
              title="Lớp chưa có sinh viên"
              description="Đề chưa có roster sinh viên cho lớp này, hoặc lớp chưa được giao đề."
            />
          ) : null}

          {!isLoading && !loadError && stats && stats.totalStudents > 0 ? (
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
