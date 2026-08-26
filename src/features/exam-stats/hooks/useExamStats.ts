import { useQuery } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import { getExamStats } from '../api/examStats.api'

export const examStatsKeys = {
  all: ['exam-stats'] as const,
  details: () => [...examStatsKeys.all, 'detail'] as const,
  detail: (examId: number, classroomId: number | undefined) =>
    [...examStatsKeys.details(), examId, classroomId ?? null] as const,
}

export function useExamStats(examId: number | undefined, classroomId: number | undefined) {
  return useQuery({
    queryKey: examStatsKeys.detail(examId ?? -1, classroomId),
    queryFn: () => getExamStats(examId!, classroomId),
    enabled: examId !== undefined && classroomId !== undefined,
    staleTime: STALE_TIME.detail,
  })
}
