import { useMemo, useState } from 'react'

import { EmptyState } from '../../../components/ui/EmptyState'
import { StudentClassroomSubjectCard } from '../components/StudentClassroomSubjectCard'
import { StudentExamCard } from '../components/StudentExamCard'
import {
  MOCK_STUDENT_CLASSROOM_SUBJECTS,
  MOCK_STUDENT_EXAMS,
  type StudentClassroomSubject,
} from '../types/studentExam.types'

/** Loại A — UI + mock. Chưa nối API danh sách đề sinh viên. */
export function StudentExamListPage() {
  const [selected, setSelected] = useState<StudentClassroomSubject | null>(null)

  const exams = useMemo(() => {
    if (!selected) return []
    return MOCK_STUDENT_EXAMS.filter((exam) => exam.classroomSubjectId === selected.id)
  }, [selected])

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Bài thi</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bài thi của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chọn lớp — môn học để xem đề và trạng thái làm bài.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lớp — môn học</p>
          {MOCK_STUDENT_CLASSROOM_SUBJECTS.map((item) => (
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
              ? `Đề thi · ${selected.classroomName} · ${selected.subjectName}`
              : 'Danh sách đề thi'}
          </p>

          {!selected ? (
            <EmptyState
              title="Chưa chọn lớp — môn"
              description="Chọn một lớp — môn học để xem các bài thi tương ứng."
            />
          ) : null}

          {selected && exams.length === 0 ? (
            <EmptyState
              title="Chưa có bài thi"
              description="Lớp — môn này chưa có đề được giao hoặc mở."
            />
          ) : null}

          {selected && exams.length > 0 ? (
            <div className="space-y-3">
              {exams.map((exam) => (
                <StudentExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
