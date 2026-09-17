import { useMemo, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import type { ClassroomItem } from '../../classrooms/types/classroom.types'
import { useMyClasses } from '../../classrooms/hooks/useClassrooms'
import { StudentClassroomSubjectCard } from '../components/StudentClassroomSubjectCard'
import { StudentExamCard } from '../components/StudentExamCard'
import { StudentExamListToolbar } from '../components/StudentExamListToolbar'
import { useMyExams } from '../hooks/useExams'
import {
  filterAndSortStudentExams,
  mergeStudentExamsWithSubmissions,
  type StudentExamSortMode,
  type StudentExamStatus,
  type StudentMyStatus,
} from '../types/studentExam.types'
import { useMySubmissions } from '../../submissions/hooks/useSubmissions'

const PAGE_SIZE = 5
const FILTER_FETCH_SIZE = 100

export function StudentExamListPage() {
  const [selected, setSelected] = useState<ClassroomItem | null>(null)
  const [page, setPage] = useState(0)
  const [classesPage, setClassesPage] = useState(0)
  const [search, setSearch] = useState('')
  const [examStatus, setExamStatus] = useState<StudentExamStatus | ''>('')
  const [myStatus, setMyStatus] = useState<StudentMyStatus | ''>('')
  const [sortMode, setSortMode] = useState<StudentExamSortMode>('priority')

  const needsClientFilter =
    search.trim() !== '' || examStatus !== '' || myStatus !== '' || sortMode !== 'priority'

  const classesQuery = useMyClasses({ page: classesPage, size: PAGE_SIZE })
  const examsQuery = useMyExams(
    selected
      ? {
          classroomId: selected.id,
          purpose: 'EXAM',
          page: needsClientFilter ? 0 : page,
          size: needsClientFilter ? FILTER_FETCH_SIZE : PAGE_SIZE,
        }
      : undefined,
  )
  const submissionsQuery = useMySubmissions()

  const classrooms = classesQuery.data?.items ?? []
  const exams = useMemo(
    () =>
      mergeStudentExamsWithSubmissions(
        examsQuery.data?.items ?? [],
        submissionsQuery.data ?? [],
        'EXAM',
      ).map((exam) =>
        selected && !exam.classroomId ? { ...exam, classroomId: selected.id } : exam,
      ),
    [examsQuery.data?.items, submissionsQuery.data, selected],
  )

  const filteredExams = useMemo(
    () =>
      filterAndSortStudentExams(exams, {
        search,
        examStatus,
        myStatus,
        sortMode,
      }),
    [exams, search, examStatus, myStatus, sortMode],
  )

  const classesTotalPages = Math.max(1, classesQuery.data?.totalPages ?? 1)
  const classesTotal = classesQuery.data?.totalElements ?? classrooms.length

  const totalElements = needsClientFilter
    ? filteredExams.length
    : (examsQuery.data?.totalElements ?? filteredExams.length)
  const totalPages = needsClientFilter
    ? Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE))
    : Math.max(1, examsQuery.data?.totalPages ?? 1)
  const currentPage = Math.min(page, totalPages - 1)
  const pagedExams = needsClientFilter
    ? filteredExams.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)
    : filteredExams

  function resetFiltersOnSelect(classroom: ClassroomItem) {
    setSelected(classroom)
    setSearch('')
    setExamStatus('')
    setMyStatus('')
    setSortMode('priority')
    setPage(0)
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Bài thi</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bài thi của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chọn lớp — môn học để xem đề và trạng thái làm bài.
        </p>
      </div>

      {classesQuery.isLoading ? <Spinner label="Đang tải danh sách lớp..." /> : null}

      {classesQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(classesQuery.error, 'Không thể tải danh sách lớp')}
          action={
            <Button variant="secondary" onClick={() => void classesQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {classesQuery.isSuccess && classrooms.length === 0 && classesPage === 0 ? (
        <EmptyState
          title="Chưa có lớp học"
          description="Bạn chưa được ghi danh vào lớp nào. Liên hệ giáo viên để được thêm vào lớp."
        />
      ) : null}

      {classesQuery.isSuccess && (classrooms.length > 0 || classesPage > 0) ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lớp — môn học</p>
            {classrooms.map((item) => (
              <StudentClassroomSubjectCard
                key={item.id}
                item={item}
                selected={selected?.id === item.id}
                onSelect={resetFiltersOnSelect}
              />
            ))}
            {classesTotalPages > 1 ? (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  {classesPage + 1}/{classesTotalPages} · {classesTotal}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    className="h-8 px-2"
                    disabled={classesPage === 0}
                    onClick={() => setClassesPage((v) => Math.max(0, v - 1))}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-8 px-2"
                    disabled={classesPage >= classesTotalPages - 1}
                    onClick={() => setClassesPage((v) => v + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {selected
                ? `Đề thi · ${selected.className} · ${selected.subjectName || `Môn #${selected.subjectId}`}`
                : 'Danh sách đề thi'}
            </p>

            {selected ? (
              <StudentExamListToolbar
                mode="EXAM"
                search={search}
                examStatus={examStatus}
                myStatus={myStatus}
                sortMode={sortMode}
                searchPlaceholder="Tìm theo tên bài thi..."
                onSearchChange={(value) => {
                  setSearch(value)
                  setPage(0)
                }}
                onExamStatusChange={(value) => {
                  setExamStatus(value)
                  setPage(0)
                }}
                onMyStatusChange={(value) => {
                  setMyStatus(value)
                  setPage(0)
                }}
                onSortModeChange={(value) => {
                  setSortMode(value)
                  setPage(0)
                }}
              />
            ) : null}

            {!selected ? (
              <EmptyState
                title="Chưa chọn lớp — môn"
                description="Chọn một lớp — môn học để xem các bài thi tương ứng."
              />
            ) : null}

            {selected && examsQuery.isLoading ? <Spinner label="Đang tải bài thi..." /> : null}

            {selected && examsQuery.isError ? (
              <ErrorState
                message={getApiErrorMessage(examsQuery.error, 'Không thể tải danh sách bài thi')}
                action={
                  <Button variant="secondary" onClick={() => void examsQuery.refetch()}>
                    Thử lại
                  </Button>
                }
              />
            ) : null}

            {selected && examsQuery.isSuccess && exams.length === 0 ? (
              <EmptyState
                title="Chưa có bài thi"
                description="Lớp — môn này chưa có đề được giao hoặc mở."
              />
            ) : null}

            {selected && examsQuery.isSuccess && exams.length > 0 && filteredExams.length === 0 ? (
              <EmptyState
                title="Không tìm thấy bài thi"
                description="Thử đổi từ khóa, bộ lọc hoặc cách sắp xếp."
              />
            ) : null}

            {selected && examsQuery.isSuccess && filteredExams.length > 0 ? (
              <>
                <div className="space-y-3">
                  {pagedExams.map((exam) => (
                    <StudentExamCard key={exam.id} exam={exam} classroomId={selected.id} />
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  <p>
                    Trang {currentPage + 1} / {totalPages} · {totalElements} đề thi
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="h-9"
                      disabled={currentPage === 0}
                      onClick={() => setPage((value) => Math.max(0, value - 1))}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-9"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
