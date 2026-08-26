import { useMemo, useState, type FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type {
  PracticeClassroomOption,
  PracticeFormErrors,
  PracticeFormValues,
  PracticeItem,
  PracticeQuestionOption,
  PracticeSubjectOption,
} from '../types/practice.types'
import { emptyPracticeFormValues, practiceToFormValues } from '../types/practice.types'
import { PracticeConfigSection } from './PracticeConfigSection'

type PracticeFormProps = {
  mode: 'create' | 'edit'
  initialValues?: PracticeItem
  subjects: PracticeSubjectOption[]
  classrooms: PracticeClassroomOption[]
  questions: PracticeQuestionOption[]
  onSubmit: (values: PracticeFormValues) => void
  onCancel: () => void
}

export function PracticeForm({
  mode,
  initialValues,
  subjects,
  classrooms,
  questions,
  onSubmit,
  onCancel,
}: PracticeFormProps) {
  const [values, setValues] = useState<PracticeFormValues>(() =>
    initialValues ? practiceToFormValues(initialValues) : emptyPracticeFormValues(),
  )
  const [errors, setErrors] = useState<PracticeFormErrors>({})

  const filteredQuestions = useMemo(() => {
    if (values.subjectId === '') return []
    return questions.filter((question) => question.subjectId === values.subjectId)
  }, [questions, values.subjectId])

  const filteredClassrooms = useMemo(() => {
    if (values.subjectId === '') return []
    return classrooms.filter((classroom) => classroom.subjectId === values.subjectId)
  }, [classrooms, values.subjectId])

  function validate(): boolean {
    const next: PracticeFormErrors = {}
    if (!values.title.trim()) next.title = 'Nhập tiêu đề bài luyện tập'
    if (values.subjectId === '') next.subjectId = 'Chọn môn học'
    if (values.examMode === '') next.examMode = 'Chọn hình thức'
    if (values.maxScore === '' || Number(values.maxScore) <= 0) next.maxScore = 'Thang điểm phải > 0'
    if (mode === 'create' && values.questionIds.length === 0) next.questionIds = 'Chọn ít nhất 1 câu hỏi'
    if (values.config.timeLimitEnabled && (values.duration === '' || Number(values.duration) < 1)) {
      next.duration = 'Thời lượng tối thiểu 1 phút khi bật giới hạn giờ'
    }
    if (values.config.maxAttempts !== '' && Number(values.config.maxAttempts) < 1) {
      next.maxAttempts = 'Số lần làm phải ≥ 1 hoặc để trống'
    }
    if (values.config.paperCount === '' || Number(values.config.paperCount) < 1) {
      next.paperCount = 'Số mã đề ≥ 1'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <div className="space-y-1.5">
          <label htmlFor="practice-title" className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Tiêu đề
          </label>
          <Input
            id="practice-title"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="VD: Luyện chương 1"
            className={errors.title ? 'border-red-400' : ''}
          />
          {errors.title ? <p className="text-xs text-red-600">{errors.title}</p> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="practice-subject" className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Môn học
            </label>
            <select
              id="practice-subject"
              value={values.subjectId}
              disabled={mode === 'edit'}
              onChange={(event) => {
                const subjectId = event.target.value === '' ? '' : Number(event.target.value)
                setValues((current) => ({
                  ...current,
                  subjectId,
                  questionIds: [],
                  classroomIds: [],
                }))
              }}
              className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 disabled:bg-slate-50 ${
                errors.subjectId ? 'border-red-400' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
              }`}
            >
              <option value="">Chọn môn</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
            {errors.subjectId ? <p className="text-xs text-red-600">{errors.subjectId}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="practice-mode" className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Hình thức
            </label>
            <select
              id="practice-mode"
              value={values.examMode}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  examMode: event.target.value as PracticeFormValues['examMode'],
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ONLINE">Trực tuyến</option>
              <option value="OMR_PAPER">OMR giấy</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="practice-max-score" className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Thang điểm
            </label>
            <Input
              id="practice-max-score"
              type="number"
              min={1}
              value={values.maxScore}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  maxScore: event.target.value === '' ? '' : Number(event.target.value),
                }))
              }
            />
            {errors.maxScore ? <p className="text-xs text-red-600">{errors.maxScore}</p> : null}
          </div>
        </div>

        <PracticeConfigSection
          showScoreToStudent={values.config.showScoreToStudent}
          timeLimitEnabled={values.config.timeLimitEnabled}
          duration={values.duration}
          maxAttempts={values.config.maxAttempts}
          errors={{ duration: errors.duration, maxAttempts: errors.maxAttempts }}
          onChange={(patch) =>
            setValues((current) => ({
              ...current,
              duration: patch.duration !== undefined ? patch.duration : current.duration,
              config: {
                ...current.config,
                showScoreToStudent:
                  patch.showScoreToStudent !== undefined
                    ? patch.showScoreToStudent
                    : current.config.showScoreToStudent,
                timeLimitEnabled:
                  patch.timeLimitEnabled !== undefined
                    ? patch.timeLimitEnabled
                    : current.config.timeLimitEnabled,
                maxAttempts:
                  patch.maxAttempts !== undefined ? patch.maxAttempts : current.config.maxAttempts,
              },
            }))
          }
        />

        {mode === 'create' ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Câu hỏi</p>
            {values.subjectId === '' ? (
              <p className="text-sm text-slate-500">Chọn môn học trước để tải câu hỏi.</p>
            ) : filteredQuestions.length === 0 ? (
              <p className="text-sm text-slate-500">Môn này chưa có câu hỏi mock.</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
                {filteredQuestions.map((question) => {
                  const checked = values.questionIds.includes(question.questionId)
                  return (
                    <label
                      key={question.questionId}
                      className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setValues((current) => ({
                            ...current,
                            questionIds: checked
                              ? current.questionIds.filter((id) => id !== question.questionId)
                              : [...current.questionIds, question.questionId],
                          }))
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-slate-800">{question.content}</span>
                    </label>
                  )
                })}
              </div>
            )}
            {errors.questionIds ? <p className="text-xs text-red-600">{errors.questionIds}</p> : null}
          </div>
        ) : (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Danh sách câu hỏi không thể chỉnh sau khi tạo (giống đề thi).
          </p>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Giao lớp (tuỳ chọn)</p>
          {values.subjectId === '' ? (
            <p className="text-sm text-slate-500">Chọn môn trước.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredClassrooms.map((classroom) => {
                const checked = values.classroomIds.includes(classroom.id)
                return (
                  <label
                    key={classroom.id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      checked ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setValues((current) => ({
                          ...current,
                          classroomIds: checked
                            ? current.classroomIds.filter((id) => id !== classroom.id)
                            : [...current.classroomIds, classroom.id],
                        }))
                      }
                    />
                    {classroom.className}
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <details className="rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-800">Cấu hình thêm</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.config.shuffleQuestions}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    config: { ...current.config, shuffleQuestions: event.target.checked },
                  }))
                }
              />
              Trộn câu hỏi
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.config.shuffleAnswers}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    config: { ...current.config, shuffleAnswers: event.target.checked },
                  }))
                }
              />
              Trộn đáp án
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.config.allowEdit}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    config: { ...current.config, allowEdit: event.target.checked },
                  }))
                }
              />
              Cho phép sửa sau tạo mã
            </label>
            <div className="space-y-1.5">
              <label htmlFor="practice-paper-count" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Số mã đề (paperCount)
              </label>
              <Input
                id="practice-paper-count"
                type="number"
                min={1}
                value={values.config.paperCount}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    config: {
                      ...current.config,
                      paperCount: event.target.value === '' ? '' : Number(event.target.value),
                    },
                  }))
                }
              />
              {errors.paperCount ? <p className="text-xs text-red-600">{errors.paperCount}</p> : null}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="practice-semester" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Học kỳ
              </label>
              <Input
                id="practice-semester"
                value={values.config.semester}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    config: { ...current.config, semester: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="practice-year" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Năm học
              </label>
              <Input
                id="practice-year"
                value={values.config.academicYear}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    config: { ...current.config, academicYear: event.target.value },
                  }))
                }
              />
            </div>
          </div>
        </details>

        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Loại A: form gửi cứng <code className="font-mono">purpose: &quot;PRACTICE&quot;</code> khi nối API (Loại B).
        </p>
      </div>

      <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" className="flex-1">
          {mode === 'create' ? 'Tạo bài luyện tập' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
