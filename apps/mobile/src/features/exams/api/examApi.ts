import { getMyExams, type GetMyExamsParams } from '@aros/shared/features/exams/api/exams.api'
import type { StudentExamListItem } from '@aros/shared/features/exams/types/studentExam.types'

export type { StudentExamListItem }

export async function getOfficialExams(classroomId: number) {
  const params: GetMyExamsParams = {
    classroomId,
    purpose: 'EXAM',
    page: 0,
    size: 100,
  }
  const result = await getMyExams(params)
  return result.items
}
