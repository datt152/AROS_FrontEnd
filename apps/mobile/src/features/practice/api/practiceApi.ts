import { getMyExams, type GetMyExamsParams } from '@aros/shared/features/exams/api/exams.api'

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
