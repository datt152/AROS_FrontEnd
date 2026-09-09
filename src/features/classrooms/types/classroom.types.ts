export type ClassroomItem = {
  id: number
  className: string
  description: string
  semester: string
  academicYear: string
  isActive: boolean
  subjectId: number
  subjectName: string
  teacherName?: string
  teacherEmail?: string
}

export type ClassroomCreatePayload = {
  className: string
  description: string
  semester: string
  academicYear: string
  isActive: boolean
  subjectId: number
}

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

export type ClassroomStudent = {
  id: number
  fullName: string
  email: string
  phone: string
  studentCode: string
  missingStudentCode: boolean
  hasAccount: boolean
}

export type UpdateClassroomStudentCodePayload = {
  studentCode: string
}

export type CreateStudentAccountsPayload = {
  studentIds?: number[]
}

export type CreateStudentAccountStatus = 'CREATED' | 'SKIPPED' | 'FAILED'

export type CreateStudentAccountRowResult = {
  studentId: number
  email: string
  fullName: string
  status: CreateStudentAccountStatus
  message: string
}

export type CreateStudentAccountsResult = {
  total: number
  created: number
  skipped: number
  failed: number
  mailQueued: number
  results: CreateStudentAccountRowResult[]
}

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

export type EnrollStudentPayload = {
  studentEmails: string[]
}

export type EnrollStudentFormValues = {
  studentEmailsText: string
}

export type EnrollStudentFormErrors = {
  studentEmailsText?: string
}

export type SubjectOption = {
  id: number
  subjectName: string
}
