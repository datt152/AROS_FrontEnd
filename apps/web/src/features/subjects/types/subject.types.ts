export type SubjectItem = {
  id: number
  subjectName: string
  description: string
  isActive: boolean
}

/** POST /v1/subjects */
export type SubjectPayload = {
  subjectName: string
  description: string
}

/** PUT /v1/subjects/{id} */
export type SubjectUpdatePayload = SubjectPayload & {
  isActive?: boolean
}

export type SubjectFormValues = {
  subjectName: string
  description: string
  isActive: boolean
}

export type SubjectFormErrors = {
  subjectName?: string
  description?: string
}
