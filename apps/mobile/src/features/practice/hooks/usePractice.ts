import { useQuery } from '@tanstack/react-query'

import { getPracticeExams } from '../api/practiceApi'

export const practiceKeys = {
  exams: (classroomId: number) => ['practice', 'exams', classroomId] as const,
}

export function usePracticeExams(classroomId: number | undefined) {
  return useQuery({
    queryKey: practiceKeys.exams(classroomId ?? -1),
    queryFn: () => getPracticeExams(classroomId!),
    enabled: classroomId !== undefined && classroomId > 0,
    staleTime: 30_000,
  })
}
