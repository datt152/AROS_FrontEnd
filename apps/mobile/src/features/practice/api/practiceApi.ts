import { getMyClasses as getMyClassesShared } from '@aros/shared/features/classrooms/api/classrooms.api'
import type { ClassroomItem } from '@aros/shared/features/classrooms/types/classroom.types'
import { getMyExams, type GetMyExamsParams } from '@aros/shared/features/exams/api/exams.api'
import type { StudentExamListItem } from '@aros/shared/features/exams/types/studentExam.types'
import { getMySubmissions } from '@aros/shared/features/submissions/api/submissions.api'

export type { ClassroomItem }
export type { StudentExamListItem }

export async function getMyClasses() {
  const result = await getMyClassesShared({ page: 0, size: 100 })
  return result.items
}

export async function getPracticeExams(classroomId: number) {
  const params: GetMyExamsParams = {
    classroomId,
    purpose: 'PRACTICE',
    page: 0,
    size: 100,
  }
  const result = await getMyExams(params)
  return result.items
}

export { getMySubmissions }
