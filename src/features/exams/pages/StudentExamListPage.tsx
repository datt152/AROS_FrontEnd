import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import type { ClassroomItem } from '../../classrooms/types/classroom.types'
import { useMyClasses } from '../../classrooms/hooks/useClassrooms'
import { StudentClassroomSubjectCard } from '../components/StudentClassroomSubjectCard'
import { StudentExamCard } from '../components/StudentExamCard'
import { useMyExams } from '../hooks/useExams'

export function StudentExamListPage() {
  const [selected, setSelected] = useState<ClassroomItem | null>(null)

  const classesQuery = useMyClasses()
  const examsQuery = useMyExams(
    selected ? { classroomId: selected.id, purpose: 'EXAM' } : undefined,
  )

  const classrooms = classesQuery.data ?? []
  const exams = examsQuery.data ?? []

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

      {classesQuery.isSuccess && classrooms.length === 0 ? (
        <EmptyState
          title="Chưa có lớp học"
          description="Bạn chưa được ghi danh vào lớp nào. Liên hệ giáo viên để được thêm vào lớp."
        />
      ) : null}

      {classesQuery.isSuccess && classrooms.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lớp — môn học</p>
            {classrooms.map((item) => (
              <StudentClassroomSubjectCard
                key={item.id}
                item={item}
                selected={selected?.id === item.id}
                onSelect={setSelected}
              />
            ))}
          </div>

          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {selected
                ? `Đề thi · ${selected.className} · ${selected.subjectName || `Môn #${selected.subjectId}`}`
                : 'Danh sách đề thi'}
            </p>

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

            {selected && examsQuery.isSuccess && exams.length > 0 ? (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <StudentExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
