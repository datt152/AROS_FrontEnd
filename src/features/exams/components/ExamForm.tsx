import { useEffect, useMemo, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import { focusFirstFormError } from '../../../utils/focusFormError'
import {
  useExamTemplate,
  useExamTemplates,
} from '../../exam-templates/hooks/useExamTemplates'
import type {
  ClassroomOption,
  ExamCreateFormValues,
  ExamFormErrors,
  ExamItem,
  ExamMode,
  ExamOnlineFormValues,
  ExamPaperFormValues,
  ExamUpdateFormValues,
  QuestionPickItem,
  SubjectOption,
} from '../types/exam.types'
import { EXAM_MODE_LABEL, QUESTION_TYPE_LABEL } from '../types/exam.types'

type QuestionPickMode = 'manual' | 'template'

type ExamFormProps = {
  mode: 'create' | 'edit'
  initialValues?: ExamItem
  lockedExamMode?: ExamMode
  subjectOptions: SubjectOption[]
  questionOptions: QuestionPickItem[]
  topicOptions?: { id: number; name: string }[]
  classroomOptions: ClassroomOption[]
  isSubmitting?: boolean
  submitError?: string | null
  onSubjectChange?: (subjectId: number) => void
  onSubmitCreate: (values: ExamCreateFormValues) => void | Promise<void>
  onSubmitUpdate: (values: ExamUpdateFormValues) => void | Promise<void>
  onCancel: () => void
}

const selectClassName = (hasError: boolean) =>
  `h-10 w-full rounded-xl border bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 disabled:opacity-60 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
  }`

/** Ngày thi OMR phải sau ngày tạo đề (tạo mới: sau hôm nay). */
function getMinExamDate(createdAt?: string) {
  const date = createdAt ? new Date(createdAt) : new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 1)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function defaultOnlineSettings(
  item?: ExamItem,
  examMode?: ExamMode | '',
): ExamOnlineFormValues {
  const online = item?.onlineSettings
  const mode = examMode || item?.examMode
  return {
    allowEdit: online?.allowEdit ?? false,
    showScoreToStudent: online?.showScoreToStudent ?? true,
    maxAttempts: online?.maxAttempts ?? 1,
    timeLimitEnabled: online?.timeLimitEnabled ?? mode !== 'OMR_PAPER',
  }
}

function defaultPaperSettings(
  item?: ExamItem,
  examMode?: ExamMode | '',
): ExamPaperFormValues {
  const paper = item?.paperSettings
  const mode = examMode || item?.examMode
  return {
    examDate: paper?.examDate ? paper.examDate.slice(0, 10) : '',
    semester: paper?.semester ?? '1',
    academicYear: paper?.academicYear ?? '2025-2026',
    shuffleQuestions: paper?.shuffleQuestions ?? false,
    shuffleAnswers: paper?.shuffleAnswers ?? false,
    paperCount: paper?.paperCount ?? (mode === 'OMR_PAPER' ? 3 : 1),
  }
}

function toCreateValues(item?: ExamItem, lockedExamMode?: ExamMode): ExamCreateFormValues {
  const examMode = lockedExamMode ?? item?.examMode ?? ''
  return {
    title: item?.title ?? '',
    duration: item?.duration ?? '',
    examMode,
    subjectId: item?.subjectId ?? '',
    questionIds: item?.questionIds ?? [],
    maxScore: item?.maxScore ?? 10,
    rawPoints: {},
    classroomIds: item?.classroomIds ?? [],
    onlineSettings: defaultOnlineSettings(item, examMode),
    paperSettings: defaultPaperSettings(item, examMode),
  }
}

function toUpdateValues(item?: ExamItem, lockedExamMode?: ExamMode): ExamUpdateFormValues {
  const examMode = lockedExamMode ?? item?.examMode ?? ''
  return {
    title: item?.title ?? '',
    duration: item?.duration ?? '',
    examMode,
    subjectId: item?.subjectId ?? '',
    maxScore: item?.maxScore ?? 10,
    onlineSettings: defaultOnlineSettings(item, examMode),
    paperSettings: defaultPaperSettings(item, examMode),
  }
}

export function ExamForm({
  mode,
  initialValues,
  lockedExamMode,
  subjectOptions,
  questionOptions,
  topicOptions = [],
  isSubmitting = false,
  submitError = null,
  onSubjectChange,
  onSubmitCreate,
  onSubmitUpdate,
  onCancel,
}: ExamFormProps) {
  const [step, setStep] = useState(1)
  const [showRawPoints, setShowRawPoints] = useState(false)
  const [topicFilter, setTopicFilter] = useState<number | ''>('')
  const [questionPickMode, setQuestionPickMode] = useState<QuestionPickMode>('manual')
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [createValues, setCreateValues] = useState<ExamCreateFormValues>(() =>
    toCreateValues(initialValues, lockedExamMode),
  )
  const [updateValues, setUpdateValues] = useState<ExamUpdateFormValues>(() =>
    toUpdateValues(initialValues, lockedExamMode),
  )
  const [errors, setErrors] = useState<ExamFormErrors>({})

  const selectedSubjectId = mode === 'create' ? createValues.subjectId : updateValues.subjectId
  const selectedMode = mode === 'create' ? createValues.examMode : updateValues.examMode
  const isOnline = selectedMode === 'ONLINE'
  const isOmr = selectedMode === 'OMR_PAPER'
  const minExamDate = getMinExamDate(mode === 'edit' ? initialValues?.createdAt : undefined)

  const templatesQuery = useExamTemplates(
    {
      subjectId: typeof selectedSubjectId === 'number' ? selectedSubjectId : undefined,
      page: 0,
      size: 50,
    },
    { enabled: mode === 'create' && typeof selectedSubjectId === 'number' && selectedSubjectId > 0 },
  )
  const templateDetailQuery = useExamTemplate(
    questionPickMode === 'template' ? (selectedTemplateId ?? undefined) : undefined,
  )

  useEffect(() => {
    if (questionPickMode !== 'template' || !templateDetailQuery.data) return
    const template = templateDetailQuery.data
    const questionIds = template.questionIds ?? []
    const rawPoints = Object.fromEntries(questionIds.map((id) => [id, 1]))
    setCreateValues((current) => ({
      ...current,
      questionIds,
      rawPoints,
    }))
    setErrors((current) => ({ ...current, questionIds: undefined }))
  }, [questionPickMode, templateDetailQuery.data])

  const availableQuestions = useMemo(() => {
    if (!selectedSubjectId) return []
    return questionOptions.filter((question) => {
      if (question.subjectId !== selectedSubjectId) return false
      if (selectedMode === 'OMR_PAPER' && question.type === 'MULTIPLE_CHOICE') return false
      if (topicFilter !== '' && question.topicId !== topicFilter) return false
      return true
    })
  }, [questionOptions, selectedSubjectId, selectedMode, topicFilter])

  const subjectTemplates = templatesQuery.data?.items ?? []

  function updateCreateField<K extends keyof ExamCreateFormValues>(key: K, value: ExamCreateFormValues[K]) {
    setCreateValues((current) => {
      const next = { ...current, [key]: value }
      if (key === 'subjectId' || key === 'examMode') {
        next.questionIds = []
        next.rawPoints = {}
        if (key === 'subjectId') next.classroomIds = []
        if (key === 'examMode') {
          const modeValue = value as ExamMode | ''
          next.onlineSettings = {
            ...next.onlineSettings,
            timeLimitEnabled: modeValue !== 'OMR_PAPER',
          }
          next.paperSettings = {
            ...next.paperSettings,
            paperCount: modeValue === 'OMR_PAPER' ? 3 : 1,
          }
        }
      }
      return next
    })
    if (key === 'subjectId') {
      setTopicFilter('')
      setSelectedTemplateId(null)
      setQuestionPickMode('manual')
    }
    if (key === 'subjectId' && typeof value === 'number' && value > 0) {
      onSubjectChange?.(value)
    }
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function updateUpdateField<K extends keyof ExamUpdateFormValues>(key: K, value: ExamUpdateFormValues[K]) {
    setUpdateValues((current) => ({ ...current, [key]: value }))
    if (key === 'subjectId' && typeof value === 'number' && value > 0) {
      onSubjectChange?.(value)
    }
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function updateCreateOnline<K extends keyof ExamOnlineFormValues>(key: K, value: ExamOnlineFormValues[K]) {
    setCreateValues((current) => ({
      ...current,
      onlineSettings: { ...current.onlineSettings, [key]: value },
    }))
    if (key === 'maxAttempts') setErrors((current) => ({ ...current, maxAttempts: undefined }))
  }

  function updateCreatePaper<K extends keyof ExamPaperFormValues>(key: K, value: ExamPaperFormValues[K]) {
    setCreateValues((current) => ({
      ...current,
      paperSettings: { ...current.paperSettings, [key]: value },
    }))
    if (key === 'paperCount' || key === 'examDate') {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  function updateUpdateOnline<K extends keyof ExamOnlineFormValues>(key: K, value: ExamOnlineFormValues[K]) {
    setUpdateValues((current) => ({
      ...current,
      onlineSettings: { ...(current.onlineSettings ?? defaultOnlineSettings()), [key]: value },
    }))
    if (key === 'maxAttempts') setErrors((current) => ({ ...current, maxAttempts: undefined }))
  }

  function updateUpdatePaper<K extends keyof ExamPaperFormValues>(key: K, value: ExamPaperFormValues[K]) {
    setUpdateValues((current) => ({
      ...current,
      paperSettings: { ...(current.paperSettings ?? defaultPaperSettings()), [key]: value },
    }))
    if (key === 'paperCount' || key === 'examDate') {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  function toggleQuestion(questionId: number) {
    setCreateValues((current) => {
      const exists = current.questionIds.includes(questionId)
      const questionIds = exists
        ? current.questionIds.filter((id) => id !== questionId)
        : [...current.questionIds, questionId]
      const rawPoints = { ...current.rawPoints }
      if (exists) delete rawPoints[questionId]
      else rawPoints[questionId] = 1
      return { ...current, questionIds, rawPoints }
    })
    setErrors((current) => ({ ...current, questionIds: undefined }))
  }

  function validateMeta(values: { title: string; duration: number | ''; examMode: ExamMode | ''; subjectId: number | '' }) {
    const nextErrors: ExamFormErrors = {}
    if (!values.title.trim()) nextErrors.title = 'Vui lòng nhập tiêu đề'
    if (values.duration === '' || Number(values.duration) <= 0) nextErrors.duration = 'Thời gian phải lớn hơn 0'
    if (!values.examMode) nextErrors.examMode = 'Vui lòng chọn hình thức thi'
    if (!values.subjectId) nextErrors.subjectId = 'Vui lòng chọn môn học'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, ['title', 'duration', 'examMode', 'subjectId'])
      return false
    }
    return true
  }

  function validateQuestions() {
    const nextErrors: ExamFormErrors = {}
    if (createValues.questionIds.length < 1) nextErrors.questionIds = 'Chọn ít nhất 1 câu hỏi'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, ['questionIds'])
      return false
    }
    return true
  }

  function validateSettings(values: {
    examMode: ExamMode | ''
    onlineSettings?: ExamOnlineFormValues
    paperSettings?: ExamPaperFormValues
  }) {
    const nextErrors: ExamFormErrors = {}
    if (values.examMode === 'OMR_PAPER' && values.paperSettings) {
      const examDate = values.paperSettings.examDate.trim()
      if (!examDate) {
        nextErrors.examDate = 'Vui lòng chọn ngày thi'
      } else {
        const baseline = initialValues?.createdAt ? new Date(initialValues.createdAt) : new Date()
        baseline.setHours(0, 0, 0, 0)
        const selected = new Date(`${examDate}T00:00:00`)
        if (Number.isNaN(selected.getTime()) || selected.getTime() <= baseline.getTime()) {
          nextErrors.examDate = 'Ngày thi phải sau ngày tạo đề'
        }
      }
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, ['examDate'])
      return false
    }
    return true
  }

  async function handleNext() {
    if (step === 1 && !validateMeta(createValues)) return
    if (step === 2 && !validateQuestions()) return
    setStep((value) => Math.min(value + 1, 3))
  }

  async function handleCreateSubmit() {
    if (!validateMeta(createValues) || !validateQuestions()) {
      if (!validateMeta(createValues)) setStep(1)
      else setStep(2)
      return
    }
    if (!validateSettings(createValues)) return

    await onSubmitCreate({
      ...createValues,
      title: createValues.title.trim(),
      duration: Number(createValues.duration),
      examMode: createValues.examMode as ExamMode,
      subjectId: Number(createValues.subjectId),
      maxScore: 10,
      classroomIds: [],
      onlineSettings: {
        ...createValues.onlineSettings,
        maxAttempts:
          createValues.onlineSettings.maxAttempts === ''
            ? ''
            : Number(createValues.onlineSettings.maxAttempts),
      },
      paperSettings: {
        ...createValues.paperSettings,
        paperCount:
          createValues.paperSettings.paperCount === ''
            ? ''
            : Number(createValues.paperSettings.paperCount),
      },
    })
  }

  async function handleUpdateSubmit() {
    if (!validateMeta(updateValues)) return
    if (!validateSettings(updateValues)) return
    await onSubmitUpdate({
      title: updateValues.title.trim(),
      duration: Number(updateValues.duration),
      examMode: updateValues.examMode as ExamMode,
      subjectId: Number(updateValues.subjectId),
      maxScore: 10,
      onlineSettings: updateValues.onlineSettings
        ? {
            ...updateValues.onlineSettings,
            maxAttempts:
              updateValues.onlineSettings.maxAttempts === ''
                ? ''
                : Number(updateValues.onlineSettings.maxAttempts),
          }
        : undefined,
      paperSettings: updateValues.paperSettings
        ? {
            ...updateValues.paperSettings,
            paperCount:
              updateValues.paperSettings.paperCount === ''
                ? ''
                : Number(updateValues.paperSettings.paperCount),
          }
        : undefined,
    })
  }

  const values = mode === 'create' ? createValues : updateValues
  const stepLabels = ['Thông tin', 'Câu hỏi', 'Cấu hình']
  const totalSteps = stepLabels.length

  const createOnline = createValues.onlineSettings
  const createPaper = createValues.paperSettings
  const updateOnline = updateValues.onlineSettings
  const updatePaper = updateValues.paperSettings

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        // Create wizard: không dùng type=submit cho nút cuối — tránh swap button trong cùng click
        // khiến form tự submit ngay khi vừa tới bước cuối.
        if (mode === 'edit') void handleUpdateSubmit()
      }}
      noValidate
    >
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      {mode === 'create' ? (
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          {stepLabels.map((label, index) => {
            const value = index + 1
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    step === value
                      ? 'bg-blue-600 text-white'
                      : step > value
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {value}
                </span>
                <span className={step === value ? 'text-slate-900' : ''}>{label}</span>
                {value < totalSteps ? <span className="text-slate-300">/</span> : null}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Danh sách câu hỏi không thể chỉnh sau khi tạo.
          {isOnline ? ' Trạng thái mở thi dùng nút “Mở thi”.' : ''}
        </p>
      )}

      {(mode === 'edit' || step === 1) && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Tiêu đề
            </label>
            <Input
              id="title"
              value={values.title}
              hasError={Boolean(errors.title)}
              placeholder="Vui lòng nhập tiêu đề"
              disabled={isSubmitting}
              onChange={(event) =>
                mode === 'create'
                  ? updateCreateField('title', event.target.value)
                  : updateUpdateField('title', event.target.value)
              }
            />
            {errors.title ? <p className="text-sm text-red-500">{errors.title}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="duration" className="text-sm font-medium text-slate-700">
                Thời gian (phút)
              </label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={values.duration}
                hasError={Boolean(errors.duration)}
                disabled={isSubmitting}
                onChange={(event) => {
                  const next = event.target.value === '' ? '' : Number(event.target.value)
                  if (mode === 'create') updateCreateField('duration', next)
                  else updateUpdateField('duration', next)
                }}
              />
              {errors.duration ? <p className="text-sm text-red-500">{errors.duration}</p> : null}
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-slate-700">Thang điểm</p>
              <p className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                10 (cố định)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="examMode" className="text-sm font-medium text-slate-700">
                Hình thức thi
              </label>
              {lockedExamMode ? (
                <p className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                  {EXAM_MODE_LABEL[lockedExamMode]}
                </p>
              ) : (
                <select
                  id="examMode"
                  value={values.examMode}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    const next = event.target.value as ExamMode | ''
                    if (mode === 'create') updateCreateField('examMode', next)
                    else updateUpdateField('examMode', next)
                  }}
                  className={selectClassName(Boolean(errors.examMode))}
                >
                  <option value="">Chọn hình thức</option>
                  <option value="ONLINE">{EXAM_MODE_LABEL.ONLINE}</option>
                  <option value="OMR_PAPER">{EXAM_MODE_LABEL.OMR_PAPER}</option>
                </select>
              )}
              {errors.examMode ? <p className="text-sm text-red-500">{errors.examMode}</p> : null}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="subjectId" className="text-sm font-medium text-slate-700">
                Môn học
              </label>
              <select
                id="subjectId"
                value={values.subjectId}
                disabled={isSubmitting || mode === 'edit'}
                onChange={(event) => {
                  const next = event.target.value === '' ? '' : Number(event.target.value)
                  if (mode === 'create') updateCreateField('subjectId', next)
                  else updateUpdateField('subjectId', next)
                }}
                className={selectClassName(Boolean(errors.subjectId))}
              >
                <option value="">Chọn môn học</option>
                {subjectOptions.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
              {errors.subjectId ? <p className="text-sm text-red-500">{errors.subjectId}</p> : null}
            </div>
          </div>
        </>
      )}

      {mode === 'edit' && isOnline && updateOnline ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-sm font-medium text-slate-800">Cấu hình trực tuyến</p>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={updateOnline.showScoreToStudent}
              disabled={isSubmitting}
              onChange={(event) => updateUpdateOnline('showScoreToStudent', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Hiện điểm sau khi kiểm tra
          </label>
          {updatePaper ? (
            <>
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={updatePaper.shuffleQuestions}
                  disabled={isSubmitting}
                  onChange={(event) => updateUpdatePaper('shuffleQuestions', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Xáo trộn câu hỏi
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={updatePaper.shuffleAnswers}
                  disabled={isSubmitting}
                  onChange={(event) => updateUpdatePaper('shuffleAnswers', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Xáo trộn đáp án
              </label>
            </>
          ) : null}
        </div>
      ) : null}

      {mode === 'edit' && isOmr && updatePaper ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-sm font-medium text-slate-800">Cấu hình đề giấy / OMR</p>
          <div className="space-y-1.5">
            <label htmlFor="editExamDate" className="text-sm font-medium text-slate-700">
              Ngày thi
            </label>
            <Input
              id="editExamDate"
              type="date"
              min={minExamDate}
              value={updatePaper.examDate}
              hasError={Boolean(errors.examDate)}
              disabled={isSubmitting}
              onChange={(event) => updateUpdatePaper('examDate', event.target.value)}
            />
            {errors.examDate ? <p className="text-sm text-red-500">{errors.examDate}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="editSemester" className="text-sm font-medium text-slate-700">
                Học kỳ
              </label>
              <Input
                id="editSemester"
                value={updatePaper.semester}
                disabled={isSubmitting}
                onChange={(event) => updateUpdatePaper('semester', event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="editAcademicYear" className="text-sm font-medium text-slate-700">
                Năm học
              </label>
              <Input
                id="editAcademicYear"
                value={updatePaper.academicYear}
                disabled={isSubmitting}
                onChange={(event) => updateUpdatePaper('academicYear', event.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={updatePaper.shuffleQuestions}
              disabled={isSubmitting}
              onChange={(event) => updateUpdatePaper('shuffleQuestions', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Xáo trộn câu hỏi
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={updatePaper.shuffleAnswers}
              disabled={isSubmitting}
              onChange={(event) => updateUpdatePaper('shuffleAnswers', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Xáo trộn đáp án
          </label>
        </div>
      ) : null}

      {mode === 'create' && step === 2 ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Chọn câu hỏi</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Chọn thủ công từng câu hoặc lấy nguyên bộ từ thư viện đề.
              {isOmr ? ' OMR chỉ hỗ trợ câu một đáp án.' : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setQuestionPickMode('manual')
                setSelectedTemplateId(null)
                setCreateValues((current) => ({ ...current, questionIds: [], rawPoints: {} }))
              }}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                questionPickMode === 'manual'
                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Chọn thủ công
            </button>
            <button
              type="button"
              disabled={isSubmitting || !selectedSubjectId}
              onClick={() => {
                setQuestionPickMode('template')
                setCreateValues((current) => ({ ...current, questionIds: [], rawPoints: {} }))
              }}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                questionPickMode === 'template'
                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Theo bộ đề
            </button>
          </div>

          {questionPickMode === 'template' ? (
            <div className="space-y-3">
              {templatesQuery.isLoading ? <Spinner label="Đang tải bộ đề..." /> : null}
              {templatesQuery.isError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  Không thể tải thư viện đề.
                </p>
              ) : null}
              {templatesQuery.isSuccess && subjectTemplates.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  Môn này chưa có template. Tạo trong Thư viện đề hoặc chọn thủ công.
                </p>
              ) : null}
              {subjectTemplates.length > 0 ? (
                <ul className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">
                  {subjectTemplates.map((template) => {
                    const selected = selectedTemplateId === template.id
                    const questionCount = template.totalQuestions || template.questionIds.length
                    return (
                      <li key={template.id}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 ${
                            selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="exam-template"
                            checked={selected}
                            disabled={isSubmitting || questionCount < 1}
                            onChange={() => setSelectedTemplateId(template.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">{template.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {questionCount} câu
                              {questionCount < 1 ? ' · chưa có câu hỏi' : ''}
                            </p>
                          </div>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
              {selectedTemplateId && templateDetailQuery.isLoading ? (
                <Spinner label="Đang tải câu hỏi bộ đề..." />
              ) : null}
              {selectedTemplateId && createValues.questionIds.length > 0 ? (
                <p className="text-xs text-emerald-700">
                  Đã lấy {createValues.questionIds.length} câu từ bộ đề đã chọn.
                </p>
              ) : null}
              {errors.questionIds ? (
                <p className="text-sm text-red-500" data-form-field="questionIds">
                  {errors.questionIds}
                </p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="topicFilter" className="text-sm font-medium text-slate-700">
                  Lọc theo chủ đề
                </label>
                <select
                  id="topicFilter"
                  value={topicFilter}
                  disabled={isSubmitting || !selectedSubjectId}
                  onChange={(event) =>
                    setTopicFilter(event.target.value === '' ? '' : Number(event.target.value))
                  }
                  className={selectClassName(false)}
                >
                  <option value="">Tất cả chủ đề</option>
                  {topicOptions.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.questionIds ? (
                <p className="text-sm text-red-500" data-form-field="questionIds">
                  {errors.questionIds}
                </p>
              ) : null}
              {availableQuestions.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  Không có câu hỏi phù hợp.
                </p>
              ) : (
                <ul className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">
                  {availableQuestions.map((question) => (
                    <li key={question.questionId}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={createValues.questionIds.includes(question.questionId)}
                          disabled={isSubmitting}
                          onChange={() => toggleQuestion(question.questionId)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{question.content}</p>
                          <p className="mt-1 text-xs text-slate-500">{QUESTION_TYPE_LABEL[question.type]}</p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={() => setShowRawPoints((value) => !value)}
              >
                {showRawPoints ? 'Ẩn tùy chỉnh điểm' : 'Hiện tùy chỉnh điểm (nâng cao)'}
              </button>
              {showRawPoints ? (
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                  {createValues.questionIds.map((questionId) => (
                    <div key={questionId} className="flex items-center gap-3">
                      <p className="min-w-0 flex-1 truncate text-xs text-slate-600">#{questionId}</p>
                      <Input
                        type="number"
                        min={0}
                        step="0.25"
                        className="w-24"
                        value={createValues.rawPoints[questionId] ?? 1}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateCreateField('rawPoints', {
                            ...createValues.rawPoints,
                            [questionId]: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {mode === 'create' && step === 3 ? (
        <div className="space-y-4">
          {isOnline ? (
            <label className="flex items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={createOnline.showScoreToStudent}
                disabled={isSubmitting}
                onChange={(event) => updateCreateOnline('showScoreToStudent', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              Hiện điểm sau khi kiểm tra
            </label>
          ) : null}

          {isOmr ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor="examDate" className="text-sm font-medium text-slate-700">
                  Ngày thi
                </label>
                <Input
                  id="examDate"
                  type="date"
                  min={minExamDate}
                  value={createPaper.examDate}
                  hasError={Boolean(errors.examDate)}
                  disabled={isSubmitting}
                  onChange={(event) => updateCreatePaper('examDate', event.target.value)}
                />
                {errors.examDate ? <p className="text-sm text-red-500">{errors.examDate}</p> : null}
                <p className="text-xs text-slate-500">Phải sau ngày tạo đề (sau hôm nay).</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Học kỳ</label>
                  <Input
                    value={createPaper.semester}
                    disabled={isSubmitting}
                    onChange={(event) => updateCreatePaper('semester', event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Năm học</label>
                  <Input
                    value={createPaper.academicYear}
                    disabled={isSubmitting}
                    onChange={(event) => updateCreatePaper('academicYear', event.target.value)}
                  />
                </div>
              </div>
            </>
          ) : null}

          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={createPaper.shuffleQuestions}
              disabled={isSubmitting}
              onChange={(event) => updateCreatePaper('shuffleQuestions', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Xáo trộn câu hỏi
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={createPaper.shuffleAnswers}
              disabled={isSubmitting}
              onChange={(event) => updateCreatePaper('shuffleAnswers', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Xáo trộn đáp án
          </label>

          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Giao lớp sau khi tạo — dùng “Chọn lớp” ở chi tiết đề hoặc danh sách.
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <div className="flex gap-2">
          {mode === 'create' && step > 1 ? (
            <Button type="button" variant="secondary" disabled={isSubmitting} onClick={() => setStep((value) => value - 1)}>
              Quay lại
            </Button>
          ) : null}
          {mode === 'create' && step < totalSteps ? (
            <Button type="button" disabled={isSubmitting} onClick={() => void handleNext()}>
              Tiếp tục
            </Button>
          ) : mode === 'create' ? (
            <Button type="button" disabled={isSubmitting} onClick={() => void handleCreateSubmit()}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo đề (nháp)'}
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
