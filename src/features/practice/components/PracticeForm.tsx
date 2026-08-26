import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import {
  useExamTemplate,
  useExamTemplates,
} from '../../exam-templates/hooks/useExamTemplates'
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

type QuestionPickMode = 'manual' | 'template'

type PracticeFormProps = {
  mode: 'create' | 'edit'
  initialValues?: PracticeItem
  subjects: PracticeSubjectOption[]
  classrooms: PracticeClassroomOption[]
  questions: PracticeQuestionOption[]
  topics?: { id: number; name: string }[]
  onSubjectChange?: (subjectId: number | undefined) => void
  onSubmit: (values: PracticeFormValues) => void
  onCancel: () => void
}

export function PracticeForm({
  mode,
  initialValues,
  subjects,
  classrooms,
  questions,
  topics = [],
  onSubjectChange,
  onSubmit,
  onCancel,
}: PracticeFormProps) {
  const [values, setValues] = useState<PracticeFormValues>(() =>
    initialValues ? practiceToFormValues(initialValues) : emptyPracticeFormValues(),
  )
  const [errors, setErrors] = useState<PracticeFormErrors>({})
  const [topicFilter, setTopicFilter] = useState<number | ''>('')
  const [questionPickMode, setQuestionPickMode] = useState<QuestionPickMode>('manual')
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)

  const templatesQuery = useExamTemplates(
    {
      subjectId: typeof values.subjectId === 'number' ? values.subjectId : undefined,
      page: 0,
      size: 50,
    },
    { enabled: mode === 'create' && typeof values.subjectId === 'number' && values.subjectId > 0 },
  )
  const templateDetailQuery = useExamTemplate(
    questionPickMode === 'template' ? (selectedTemplateId ?? undefined) : undefined,
  )

  useEffect(() => {
    if (questionPickMode !== 'template' || !templateDetailQuery.data) return
    const template = templateDetailQuery.data
    setValues((current) => ({
      ...current,
      questionIds: template.questionIds ?? [],
    }))
    setErrors((current) => ({ ...current, questionIds: undefined }))
  }, [questionPickMode, templateDetailQuery.data])

  const filteredQuestions = useMemo(() => {
    if (values.subjectId === '') return []
    return questions.filter((question) => {
      if (question.subjectId !== values.subjectId) return false
      if (topicFilter !== '' && question.topicId !== topicFilter) return false
      return true
    })
  }, [questions, values.subjectId, topicFilter])

  const filteredClassrooms = useMemo(() => {
    if (values.subjectId === '') return []
    return classrooms.filter((classroom) => classroom.subjectId === values.subjectId)
  }, [classrooms, values.subjectId])

  const subjectTemplates = templatesQuery.data?.items ?? []

  function validate(): boolean {
    const next: PracticeFormErrors = {}
    if (!values.title.trim()) next.title = 'Nhập tiêu đề bài luyện tập'
    if (values.subjectId === '') next.subjectId = 'Chọn môn học'
    if (mode === 'create' && values.questionIds.length === 0) next.questionIds = 'Chọn ít nhất 1 câu hỏi'
    if (values.config.timeLimitEnabled && (values.duration === '' || Number(values.duration) < 1)) {
      next.duration = 'Thời lượng tối thiểu 1 phút khi bật giới hạn giờ'
    }
    if (values.config.maxAttempts !== '' && Number(values.config.maxAttempts) < 1) {
      next.maxAttempts = 'Số lần làm phải ≥ 1 hoặc để trống'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return
    onSubmit({
      ...values,
      examMode: 'ONLINE',
      maxScore: 10,
      config: {
        ...values.config,
        showScoreToStudent: true,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <div className="space-y-1.5">
          <label htmlFor="practice-title" className="text-sm font-medium text-slate-700">
            Tiêu đề
          </label>
          <Input
            id="practice-title"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Vui lòng nhập tiêu đề"
            className={errors.title ? 'border-red-400' : ''}
          />
          {errors.title ? <p className="text-xs text-red-600">{errors.title}</p> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="practice-subject" className="text-sm font-medium text-slate-700">
              Môn học
            </label>
            <select
              id="practice-subject"
              value={values.subjectId}
              disabled={mode === 'edit'}
              onChange={(event) => {
                const subjectId = event.target.value === '' ? '' : Number(event.target.value)
                setTopicFilter('')
                setSelectedTemplateId(null)
                setQuestionPickMode('manual')
                setValues((current) => ({
                  ...current,
                  subjectId,
                  questionIds: [],
                  classroomIds: [],
                }))
                onSubjectChange?.(typeof subjectId === 'number' ? subjectId : undefined)
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
            <p className="text-sm font-medium text-slate-700">Hình thức</p>
            <p className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
              Trực tuyến (cố định)
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-700">Thang điểm</p>
            <p className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
              10 (cố định)
            </p>
          </div>
        </div>

        <PracticeConfigSection
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
            <p className="text-sm font-medium text-slate-700">Câu hỏi</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuestionPickMode('manual')
                  setSelectedTemplateId(null)
                  setValues((current) => ({ ...current, questionIds: [] }))
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                  questionPickMode === 'manual'
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                Chọn thủ công
              </button>
              <button
                type="button"
                disabled={values.subjectId === ''}
                onClick={() => {
                  setQuestionPickMode('template')
                  setValues((current) => ({ ...current, questionIds: [] }))
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-50 ${
                  questionPickMode === 'template'
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                Theo bộ đề
              </button>
            </div>

            {questionPickMode === 'template' ? (
              <div className="space-y-2">
                {values.subjectId === '' ? (
                  <p className="text-sm text-slate-500">Chọn môn học trước.</p>
                ) : templatesQuery.isLoading ? (
                  <Spinner label="Đang tải bộ đề..." />
                ) : subjectTemplates.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Chưa có template cho môn này. Tạo trong Thư viện đề hoặc chọn thủ công.
                  </p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
                    {subjectTemplates.map((template) => {
                      const selected = selectedTemplateId === template.id
                      const questionCount = template.totalQuestions || template.questionIds.length
                      return (
                        <label
                          key={template.id}
                          className={`flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 ${
                            selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="practice-template"
                            checked={selected}
                            disabled={questionCount < 1}
                            onChange={() => setSelectedTemplateId(template.id)}
                            className="mt-1"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm text-slate-800">{template.title}</span>
                            <span className="block text-xs text-slate-500">{questionCount} câu</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
                {selectedTemplateId && templateDetailQuery.isLoading ? (
                  <Spinner label="Đang tải câu hỏi..." />
                ) : null}
                {selectedTemplateId && values.questionIds.length > 0 ? (
                  <p className="text-xs text-emerald-700">
                    Đã lấy {values.questionIds.length} câu từ bộ đề.
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                {values.subjectId !== '' ? (
                  <select
                    value={topicFilter}
                    onChange={(event) =>
                      setTopicFilter(event.target.value === '' ? '' : Number(event.target.value))
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Tất cả chủ đề</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                {values.subjectId === '' ? (
                  <p className="text-sm text-slate-500">Chọn môn học trước để tải câu hỏi.</p>
                ) : filteredQuestions.length === 0 ? (
                  <p className="text-sm text-slate-500">Không có câu hỏi phù hợp.</p>
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
              </>
            )}
            {errors.questionIds ? <p className="text-xs text-red-600">{errors.questionIds}</p> : null}
          </div>
        ) : (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Danh sách câu hỏi không thể chỉnh sau khi tạo (giống đề thi).
          </p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Giao lớp (tuỳ chọn)</p>
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
      </div>

      <div className="flex shrink-0 gap-2 border-t border-slate-200 bg-white px-5 py-4">
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
