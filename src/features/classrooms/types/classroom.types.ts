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

/** Matches ClassroomRequest from backend */
export type ClassroomPayload = {
  className: string
  description: string
  semester: string
  academicYear: string
  isActive: boolean
  subjectId: number
}

export type ClassroomFormValues = ClassroomPayload

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

/** Option for subject select (from subjects feature later) */
export type SubjectOption = {
  id: number
  subjectName: string
}
