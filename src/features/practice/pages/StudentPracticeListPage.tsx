import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { StudentClassroomSubjectCard } from '../../exams/components/StudentClassroomSubjectCard'
import { StudentExamCard } from '../../exams/components/StudentExamCard'
import { useMyExams } from '../../exams/hooks/useExams'
import { useMyClasses } from '../../classrooms/hooks/useClassrooms'
import type { ClassroomItem } from '../../classrooms/types/classroom.types'

const PAGE_SIZE = 10
const SEARCH_FETCH_SIZE = 100

export function StudentPracticeListPage() {
  const [selected, setSelected] = useState<ClassroomItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [classesPage, setClassesPage] = useState(0)

  const hasSearch = searchQuery.trim() !== ''

  const classesQuery = useMyClasses({ page: classesPage, size: PAGE_SIZE })
  const examsQuery = useMyExams(
    selected
      ? {
          classroomId: selected.id,
          purpose: 'PRACTICE',
          page: hasSearch ? 0 : page,
          size: hasSearch ? SEARCH_FETCH_SIZE : PAGE_SIZE,
        }
      : undefined,
  )

  const classrooms = classesQuery.data?.items ?? []
  const exams = examsQuery.data?.items ?? []

  const filteredExams = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return exams
    return exams.filter((exam) => exam.title.toLowerCase().includes(keyword))
  }, [exams, searchQuery])

  const classesTotalPages = Math.max(1, classesQuery.data?.totalPages ?? 1)
  const classesTotal = classesQuery.data?.totalElements ?? classrooms.length

  const totalElements = hasSearch
    ? filteredExams.length
    : (examsQuery.data?.totalElements ?? filteredExams.length)
  const totalPages = hasSearch
    ? Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE))
    : Math.max(1, examsQuery.data?.totalPages ?? 1)
  const currentPage = Math.min(page, totalPages - 1)
  const pagedExams = hasSearch
    ? filteredExams.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)
    : filteredExams

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Luyện tập</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bài luyện tập</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chọn lớp — môn học để xem bài luyện tập và trạng thái làm bài.
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
                onSelect={(classroom) => {
                  setSelected(classroom)
                  setSearchQuery('')
                  setPage(0)
                }}
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
                ? `Luyện tập · ${selected.className} · ${selected.subjectName || `Môn #${selected.subjectId}`}`
                : 'Danh sách luyện tập'}
            </p>

            {selected ? (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  placeholder="Tìm theo tên bài luyện tập..."
                  className="pl-9"
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setPage(0)
                  }}
                />
              </div>
            ) : null}

            {!selected ? (
              <EmptyState
                title="Chưa chọn lớp — môn"
                description="Chọn một lớp — môn học để xem các bài luyện tập tương ứng."
              />
            ) : null}

            {selected && examsQuery.isLoading ? <Spinner label="Đang tải bài luyện tập..." /> : null}

            {selected && examsQuery.isError ? (
              <ErrorState
                message={getApiErrorMessage(examsQuery.error, 'Không thể tải danh sách luyện tập')}
                action={
                  <Button variant="secondary" onClick={() => void examsQuery.refetch()}>
                    Thử lại
                  </Button>
                }
              />
            ) : null}

            {selected && examsQuery.isSuccess && exams.length === 0 ? (
              <EmptyState
                title="Chưa có bài luyện tập"
                description="Lớp — môn này chưa có bài luyện tập được giao hoặc mở."
              />
            ) : null}

            {selected && examsQuery.isSuccess && exams.length > 0 && filteredExams.length === 0 ? (
              <EmptyState
                title="Không tìm thấy bài luyện tập"
                description="Thử đổi từ khóa tìm kiếm."
              />
            ) : null}

            {selected && examsQuery.isSuccess && filteredExams.length > 0 ? (
              <>
                <div className="space-y-3">
                  {pagedExams.map((exam) => (
                    <StudentExamCard
                      key={exam.id}
                      exam={exam}
                      classroomId={selected.id}
                      mode="PRACTICE"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  <p>
                    Trang {currentPage + 1} / {totalPages} · {totalElements} bài luyện tập
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
