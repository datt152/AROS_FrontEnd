import { apiClient } from '../../../lib/axios'
import type {
  GradingSheet,
  GradingStudentRow,
  GradingStudentStatus,
  QuestionType,
  SubmissionDetail,
  SubmissionDetailItem,
} from '../types/grading.types'

type GradingStudentDto = {
  studentId?: number
  fullName?: string
  email?: string
  studentCode?: string
  status?: string
  submissionId?: number | null
  score?: number | null
  versionCode?: string | null
  startTime?: string | null
  submitTime?: string | null
}

type GradingSheetDto = {
  examId?: number
  examTitle?: string
  classroomId?: number
  classroomName?: string
  maxScore?: number
  students?: GradingStudentDto[]
}

type SubmissionDetailItemDto = {
  questionId?: number
  order?: number
  content?: string
  type?: QuestionType
  selectedAnswer?: string | null
  correctAnswer?: string
  isCorrect?: boolean
  rawPoint?: number
}

type SubmissionDetailDto = {
  submissionId?: number
  examId?: number
  examTitle?: string
  versionCode?: string
  studentId?: number
  fullName?: string
  email?: string
  studentCode?: string
  status?: string
  score?: number | null
  maxScore?: number
  correctQuestions?: number
  totalQuestions?: number
  startTime?: string | null
  submitTime?: string | null
  details?: SubmissionDetailItemDto[]
}

const GRADING_STATUSES: GradingStudentStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'EXPIRED', 'SUBMITTED']

function unwrapObject<T extends object>(data: unknown): T | null {
  if (!data || typeof data !== 'object') return null
  const record = data as { data?: unknown }
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as T
  }
  return data as T
}

function normalizeStatus(value: string | undefined): GradingStudentStatus {
  const upper = (value ?? '').toUpperCase() as GradingStudentStatus
  return GRADING_STATUSES.includes(upper) ? upper : 'NOT_STARTED'
}

function normalizeStudent(dto: GradingStudentDto): GradingStudentRow | null {
  if (dto.studentId === undefined || !dto.fullName) return null
  return {
    studentId: dto.studentId,
    fullName: dto.fullName,
    email: dto.email ?? '',
    studentCode: dto.studentCode ?? '',
    status: normalizeStatus(dto.status),
    submissionId: dto.submissionId ?? null,
    score: dto.score ?? null,
    versionCode: dto.versionCode ?? null,
    startTime: dto.startTime ?? null,
    submitTime: dto.submitTime ?? null,
  }
}

function normalizeSheet(dto: GradingSheetDto): GradingSheet | null {
  if (dto.examId === undefined || dto.classroomId === undefined) return null
  return {
    examId: dto.examId,
    examTitle: dto.examTitle ?? '',
    classroomId: dto.classroomId,
    classroomName: dto.classroomName ?? '',
    maxScore: dto.maxScore ?? 0,
    students: (dto.students ?? [])
      .map(normalizeStudent)
      .filter((item): item is GradingStudentRow => item !== null),
  }
}

function normalizeDetailItem(dto: SubmissionDetailItemDto): SubmissionDetailItem | null {
  if (dto.questionId === undefined || !dto.content) return null
  return {
    questionId: dto.questionId,
    order: dto.order ?? 0,
    content: dto.content,
    type: dto.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE',
    selectedAnswer: dto.selectedAnswer ?? null,
    correctAnswer: dto.correctAnswer ?? '',
    isCorrect: Boolean(dto.isCorrect),
    rawPoint: dto.rawPoint ?? 0,
  }
}

function normalizeSubmissionDetail(dto: SubmissionDetailDto): SubmissionDetail | null {
  if (dto.submissionId === undefined || dto.studentId === undefined || !dto.fullName) return null
  return {
    submissionId: dto.submissionId,
    examId: dto.examId ?? 0,
    examTitle: dto.examTitle ?? '',
    versionCode: dto.versionCode ?? '',
    studentId: dto.studentId,
    fullName: dto.fullName,
    email: dto.email ?? '',
    studentCode: dto.studentCode ?? '',
    status: normalizeStatus(dto.status),
    score: dto.score ?? null,
    maxScore: dto.maxScore ?? 0,
    correctQuestions: dto.correctQuestions ?? 0,
    totalQuestions: dto.totalQuestions ?? 0,
    startTime: dto.startTime ?? null,
    submitTime: dto.submitTime ?? null,
    details: (dto.details ?? [])
      .map(normalizeDetailItem)
      .filter((item): item is SubmissionDetailItem => item !== null),
  }
}

export async function getExamGrading(examId: number, classroomId: number): Promise<GradingSheet> {
  const response = await apiClient.get<unknown>(`/v1/exams/${examId}/grading`, {
    params: { classroomId },
  })
  const sheet = normalizeSheet(unwrapObject<GradingSheetDto>(response.data) ?? {})
  if (!sheet) throw new Error('Không đọc được bảng chấm điểm')
  return sheet
}

export async function getSubmissionDetail(submissionId: number): Promise<SubmissionDetail> {
  const response = await apiClient.get<unknown>(`/v1/submissions/${submissionId}`)
  const detail = normalizeSubmissionDetail(unwrapObject<SubmissionDetailDto>(response.data) ?? {})
  if (!detail) throw new Error('Không đọc được chi tiết bài nộp')
  return detail
}
