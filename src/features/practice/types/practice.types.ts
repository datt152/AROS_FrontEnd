import type { ExamItem, ExamStatus } from '../../exams/types/exam.types'

export type PracticeStatus = ExamStatus

export type PracticeMode = 'ONLINE' | 'OMR_PAPER'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'

export type PracticeConfig = {
  showScoreToStudent: boolean
  timeLimitEnabled: boolean
  maxAttempts: number | null
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  paperCount: number
  allowEdit: boolean
  semester: string
  academicYear: string
}

export type PracticeItem = {
  id: number
  title: string
  purpose: 'PRACTICE'
  duration: number
  examMode: PracticeMode
  status: PracticeStatus
  subjectId: number
  subjectName: string
  maxScore: number
  totalQuestions: number
  classroomIds: number[]
  createdAt: string
  config: PracticeConfig
  versionCodes: string[]
  questionIds: number[]
  /** Có khi GET detail nhúng danh sách câu hỏi */
  questions?: PracticeQuestionOption[]
  startAt?: string | null
  endAt?: string | null
  sourceTemplateId?: number | null
}

export type PracticeSubjectOption = {
  id: number
  subjectName: string
}

export type PracticeClassroomOption = {
  id: number
  className: string
  subjectId: number
}

export type PracticeQuestionOption = {
  questionId: number
  content: string
  type: QuestionType
  subjectId: number
  topicId?: number | null
}

export type PracticeFormValues = {
  title: string
  duration: number | ''
  examMode: PracticeMode | ''
  subjectId: number | ''
  questionIds: number[]
  maxScore: number | ''
  classroomIds: number[]
  config: {
    showScoreToStudent: boolean
    timeLimitEnabled: boolean
    maxAttempts: number | ''
    shuffleQuestions: boolean
    shuffleAnswers: boolean
    paperCount: number | ''
    allowEdit: boolean
    semester: string
    academicYear: string
  }
}

export type PracticeFormErrors = {
  title?: string
  duration?: string
  examMode?: string
  subjectId?: string
  questionIds?: string
  maxScore?: string
  maxAttempts?: string
  paperCount?: string
}

export const PRACTICE_STATUS_LABEL: Record<PracticeStatus, string> = {
  DRAFT: 'Nháp',
  UPCOMING: 'Sắp mở',
  ONGOING: 'Đang mở',
  COMPLETED: 'Hoàn thành',
  CLOSED: 'Đã đóng',
}

export const PRACTICE_STATUS_BADGE_CLASS: Record<PracticeStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  UPCOMING: 'bg-sky-50 text-sky-800',
  ONGOING: 'bg-emerald-50 text-emerald-800',
  COMPLETED: 'bg-violet-50 text-violet-800',
  CLOSED: 'bg-red-50 text-red-700',
}

export function formatMaxAttempts(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Không giới hạn'
  return `${value} lần`
}

export function formatTimeLimit(enabled: boolean, duration: number) {
  if (!enabled) return 'Không'
  return `Có (${duration} phút)`
}

export function canRetryPractice(attemptNo: number, maxAttempts: number | null | undefined) {
  if (maxAttempts === null || maxAttempts === undefined) return true
  return attemptNo < maxAttempts
}

export function emptyPracticeFormValues(): PracticeFormValues {
  return {
    title: '',
    duration: 30,
    examMode: 'ONLINE',
    subjectId: '',
    questionIds: [],
    maxScore: 10,
    classroomIds: [],
    config: {
      showScoreToStudent: true,
      timeLimitEnabled: false,
      maxAttempts: '',
      shuffleQuestions: false,
      shuffleAnswers: false,
      paperCount: 1,
      allowEdit: false,
      semester: '1',
      academicYear: '2025-2026',
    },
  }
}

export function practiceToFormValues(item: PracticeItem): PracticeFormValues {
  return {
    title: item.title,
    duration: item.duration,
    examMode: 'ONLINE',
    subjectId: item.subjectId,
    questionIds: item.questionIds,
    maxScore: 10,
    classroomIds: item.classroomIds,
    config: {
      showScoreToStudent: true,
      timeLimitEnabled: item.config.timeLimitEnabled,
      maxAttempts: item.config.maxAttempts ?? '',
      shuffleQuestions: item.config.shuffleQuestions,
      shuffleAnswers: item.config.shuffleAnswers,
      paperCount: 1,
      allowEdit: false,
      semester: item.config.semester,
      academicYear: item.config.academicYear,
    },
  }
}

export function examToPracticeItem(exam: ExamItem): PracticeItem {
  const online = exam.onlineSettings
  const paper = exam.paperSettings
  return {
    id: exam.id,
    title: exam.title,
    purpose: 'PRACTICE',
    duration: exam.duration,
    examMode: exam.examMode,
    status: exam.status,
    subjectId: exam.subjectId,
    subjectName: exam.subjectName ?? `Môn #${exam.subjectId}`,
    maxScore: exam.maxScore,
    totalQuestions: exam.totalQuestions,
    classroomIds: exam.classroomIds ?? [],
    createdAt: exam.createdAt,
    versionCodes: exam.versionCodes ?? [],
    questionIds: exam.questionIds ?? [],
    questions: exam.questions?.map((question) => ({
      questionId: question.questionId,
      content: question.content,
      type: question.type,
      subjectId: question.subjectId,
      topicId: question.topicId ?? null,
    })),
    startAt: exam.startAt,
    endAt: exam.endAt,
    sourceTemplateId: exam.sourceTemplateId ?? null,
    config: {
      showScoreToStudent: online?.showScoreToStudent ?? true,
      timeLimitEnabled: online?.timeLimitEnabled ?? false,
      maxAttempts: online?.maxAttempts ?? null,
      allowEdit: online?.allowEdit ?? false,
      shuffleQuestions: paper?.shuffleQuestions ?? false,
      shuffleAnswers: paper?.shuffleAnswers ?? false,
      paperCount: paper?.paperCount ?? 1,
      semester: paper?.semester ?? '1',
      academicYear: paper?.academicYear ?? '2025-2026',
    },
  }
}
