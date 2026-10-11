export type TopicItem = {
  id: number
  name: string
  description: string
  displayOrder: number
  subjectId: number
  subjectName?: string
  isActive?: boolean
  questionCount: number
}

export type TopicPayload = {
  name: string
  description: string
  displayOrder: number
  subjectId: number
}

export type TopicUpdatePayload = TopicPayload & {
  isActive?: boolean
}

export type TopicFormValues = {
  name: string
  description: string
  displayOrder: number | ''
  isActive: boolean
}

export type TopicFormErrors = {
  name?: string
  displayOrder?: string
}

export type TopicOption = {
  id: number
  name: string
}
