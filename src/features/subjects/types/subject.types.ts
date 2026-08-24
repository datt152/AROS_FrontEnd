export type SubjectItem = {
  id: number
  subjectName: string
  description: string
}

export type SubjectFormValues = {
  subjectName: string
  description: string
}

export type SubjectFormErrors = {
  subjectName?: string
  description?: string
}
