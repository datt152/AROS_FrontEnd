export type SubjectItem = {
  id: number
  subjectName: string
  description: string
}

export type SubjectPayload = {
  subjectName: string
  description: string
}

export type SubjectFormValues = SubjectPayload

export type SubjectFormErrors = {
  subjectName?: string
  description?: string
}
