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

export type TopicFormValues = {
  name: string
  description: string
  displayOrder: number | ''
}

export type TopicFormErrors = {
  name?: string
  displayOrder?: string
}

export type TopicOption = {
  id: number
  name: string
}
