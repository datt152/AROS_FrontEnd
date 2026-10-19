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
