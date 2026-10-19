import { useQuery } from '@tanstack/react-query'

import { getOfficialExams } from '../api/examApi'

export const examKeys = {
  exams: (classroomId: number) => ['exams', 'my', classroomId] as const,
}

export function useOfficialExams(classroomId: number | undefined) {
  return useQuery({
    queryKey: examKeys.exams(classroomId ?? -1),
    queryFn: () => getOfficialExams(classroomId!),
    enabled: classroomId !== undefined && classroomId > 0,
    staleTime: 30_000,
  })
}
