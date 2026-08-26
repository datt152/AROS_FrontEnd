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

export type ExamTemplatePayload = {
  title: string
  subjectId: number
  questionIds: number[]
}

export type ExamTemplateFormValues = {
  title: string
  subjectId: number | ''
  questionIds: number[]
}

export type ExamTemplateFormErrors = {
  title?: string
  subjectId?: string
  questionIds?: string
}

export type TemplateSubjectOption = {
  id: number
  subjectName: string
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
