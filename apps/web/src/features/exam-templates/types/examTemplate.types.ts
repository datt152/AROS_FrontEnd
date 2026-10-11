import type { QuestionType } from '../../exams/types/exam.types'

export type ExamTemplateItem = {
  id: number
  title: string
  subjectId: number
  subjectName?: string
  questionIds: number[]
  totalQuestions: number
  createdAt: string
  isActive: boolean
  teacherEmail?: string
}

/** Cách chọn câu khi tạo đề mẫu */
export type ExamTemplateSelectionMode = 'MANUAL' | 'BY_TOPIC'

export type ExamTemplateTopicSelection = {
  topicId: number
  count: number
}

/**
 * Create/update payload.
 * - MANUAL: bắt buộc `questionIds`
 * - BY_TOPIC: FE gọi `POST /exam-templates/preview` rồi tạo bằng `questionIds` đã random từ BE
 */
export type ExamTemplatePayload = {
  title: string
  subjectId: number
  questionIds?: number[]
  selectionMode?: ExamTemplateSelectionMode
  topicSelections?: ExamTemplateTopicSelection[]
}

/** Body `POST /v1/exam-templates/preview` — BE reuse DTO create, cần `title` + `selectionMode`. */
export type ExamTemplatePreviewPayload = {
  title: string
  subjectId: number
  selectionMode: ExamTemplateSelectionMode
  topicSelections: ExamTemplateTopicSelection[]
}

export type ExamTemplatePreviewQuestion = {
  questionId: number
  content: string
  type?: QuestionType
  topicId?: number | null
  topicName?: string | null
}

export type ExamTemplatePreviewResult = {
  questionIds: number[]
  questions: ExamTemplatePreviewQuestion[]
  totalQuestions: number
}

export type ExamTemplateFormValues = {
  title: string
  subjectId: number | ''
  questionIds: number[]
  selectionMode: ExamTemplateSelectionMode
  /** Số câu muốn lấy theo từng topicId (chuỗi '' khi ô trống) */
  topicCounts: Record<number, number | ''>
}

export type ExamTemplateFormErrors = {
  title?: string
  subjectId?: string
  questionIds?: string
  topicCounts?: string
}

export type TemplateSubjectOption = {
  id: number
  subjectName: string
}

export type TemplateTopicOption = {
  id: number
  name: string
  questionCount: number
}

export type TemplateQuestionOption = {
  questionId: number
  content: string
  type: QuestionType
  subjectId: number
  topicId?: number | null
  difficulty?: string
}

export function formatTemplateDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
