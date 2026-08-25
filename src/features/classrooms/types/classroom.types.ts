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

/** Student row for classroom roster UI (shape can align with future API) */
export type ClassroomStudent = {
  id: number
  studentCode: string
  fullName: string
  email: string
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
