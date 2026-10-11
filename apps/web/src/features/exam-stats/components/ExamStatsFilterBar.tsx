import type {
  ExamStatsClassroomOption,
  ExamStatsExamOption,
  ExamStatsSubjectOption,
} from '../types/examStats.types'

type ExamStatsFilterBarProps = {
  subjects: ExamStatsSubjectOption[]
  classrooms: ExamStatsClassroomOption[]
  exams: ExamStatsExamOption[]
  subjectId: number | ''
  classroomId: number | ''
  examId: number | ''
  onSubjectChange: (subjectId: number | '') => void
  onClassroomChange: (classroomId: number | '') => void
  onExamChange: (examId: number | '') => void
}

const selectClassName =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

export function ExamStatsFilterBar({
  subjects,
  classrooms,
  exams,
  subjectId,
  classroomId,
  examId,
  onSubjectChange,
  onClassroomChange,
  onExamChange,
}: ExamStatsFilterBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-3">
      <div className="space-y-1.5">
        <label htmlFor="exam-stats-subject" className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Môn học
        </label>
        <select
          id="exam-stats-subject"
          value={subjectId}
          onChange={(event) => onSubjectChange(event.target.value === '' ? '' : Number(event.target.value))}
          className={selectClassName}
        >
          <option value="">Chọn môn học</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="exam-stats-classroom" className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Lớp học
        </label>
        <select
          id="exam-stats-classroom"
          value={classroomId}
          disabled={!subjectId}
          onChange={(event) => onClassroomChange(event.target.value === '' ? '' : Number(event.target.value))}
          className={selectClassName}
        >
          <option value="">{subjectId ? 'Chọn lớp học' : 'Chọn môn trước'}</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.className}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="exam-stats-exam" className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Đề thi
        </label>
        <select
          id="exam-stats-exam"
          value={examId}
          disabled={!classroomId}
          onChange={(event) => onExamChange(event.target.value === '' ? '' : Number(event.target.value))}
          className={selectClassName}
        >
          <option value="">{classroomId ? 'Chọn đề thi' : 'Chọn lớp trước'}</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
