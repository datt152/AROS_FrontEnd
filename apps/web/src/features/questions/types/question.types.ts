export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD' | 'APPLICATION'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'

export type AnswerOptionItem = {
  content: string
  isCorrect: boolean
}

/** Matches QuestionResponse from backend */
export type QuestionItem = {
  questionId: number
  subjectId: number
  topicId?: number | null
  topicName?: string | null
  content: string
  difficulty: Difficulty | null
  explanation: string | null
  options: AnswerOptionItem[]
  type: QuestionType
  subjectName?: string
}

/** Matches QuestionRequest from backend */
export type QuestionPayload = {
  subjectId: number
  topicId?: number | null
  content: string
  difficulty: Difficulty | null
  explanation: string
  options: AnswerOptionItem[]
  type: QuestionType
}

export type QuestionFormValues = QuestionPayload

export type QuestionFormErrors = {
  subjectId?: string
  topicId?: string
  content?: string
  type?: string
  options?: string
  optionContents?: string[]
}

export type SubjectOption = {
  id: number
  subjectName: string
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
  VERY_HARD: 'Rất khó',
  APPLICATION: 'Vận dụng',
}

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Một đáp án',
  MULTIPLE_CHOICE: 'Nhiều đáp án',
}

export const DIFFICULTY_BADGE_CLASS: Record<Difficulty, string> = {
  EASY: 'bg-emerald-50 text-emerald-700',
  MEDIUM: 'bg-sky-50 text-sky-700',
  HARD: 'bg-amber-50 text-amber-800',
  VERY_HARD: 'bg-orange-50 text-orange-800',
  APPLICATION: 'bg-violet-50 text-violet-800',
}
