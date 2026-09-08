/** Matches ClassroomResponse from backend */
export type ClassroomItem = {
  id: number
  className: string
  description: string
  semester: string
  academicYear: string
  isActive: boolean
  subjectId: number
  subjectName: string
  /** Có khi GET /v1/classes/my (sinh viên) */
  teacherName?: string
  teacherEmail?: string
}

/** POST /v1/classes — ClassroomRequest */
export type ClassroomCreatePayload = {
  className: string
  description: string
  semester: string
  academicYear: string
  isActive: boolean
  subjectId: number
}

/** PUT /v1/classes/{id} — ClassroomUpdateRequest (không có subjectId) */
export type ClassroomUpdatePayload = {
  className: string
  description: string
  semester: string
  academicYear: string
  isActive: boolean
}

export type ClassroomFormValues = {
  className: string
  description: string
  semester: string
  academicYear: string
  isActive: boolean
  subjectId: number
}

export type ClassroomFormSubmit =
  | { mode: 'create'; payload: ClassroomCreatePayload }
  | { mode: 'edit'; payload: ClassroomUpdatePayload }

export type ClassroomFormErrors = {
  className?: string
  description?: string
  semester?: string
  academicYear?: string
  subjectId?: string
}

/** Matches student item from GET /v1/classes/:id/students */
export type ClassroomStudent = {
  id: number
  fullName: string
  email: string
  phone: string
  studentCode: string
  missingStudentCode: boolean
}

export type UpdateClassroomStudentCodePayload = {
  studentCode: string
}

/** POST /v1/classes/{id}/students/import — StudentImportResultResponse */
export type StudentImportRowResult = {
  row: number
  email: string
  fullName: string
  studentCode: string | null
  message: string
}

export type StudentImportResult = {
  total: number
  success: number
  failed: number
  skipped: number
  errors: StudentImportRowResult[]
  successes: StudentImportRowResult[]
}

/** Matches EnrollStudentRequest from backend */
export type EnrollStudentPayload = {
  studentEmails: string[]
}

export type EnrollStudentFormValues = {
  studentEmailsText: string
}

export type EnrollStudentFormErrors = {
  studentEmailsText?: string
}

/** Option for subject select (chỉ môn active) */
export type SubjectOption = {
  id: number
  subjectName: string
}
