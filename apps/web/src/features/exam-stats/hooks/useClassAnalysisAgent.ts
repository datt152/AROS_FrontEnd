import { useMutation, useQuery } from '@tanstack/react-query'

import {
  getClassAnalysisAgentRun,
  getLatestClassInsight,
  startClassAnalysisAgent,
} from '../api/classAnalysisAgent.api'

export const classAnalysisAgentKeys = {
  all: ['class-analysis-agent'] as const,
  run: (examId: number, classroomId: number, runId: number) =>
    [...classAnalysisAgentKeys.all, 'run', examId, classroomId, runId] as const,
  latestInsight: (examId: number, classroomId: number) =>
    [...classAnalysisAgentKeys.all, 'insight', examId, classroomId] as const,
}

export function useStartClassAnalysisAgent() {
  return useMutation({
    mutationFn: ({ examId, classroomId }: { examId: number; classroomId: number }) =>
      startClassAnalysisAgent(examId, classroomId),
  })
}

export function useClassAnalysisAgentRun(
  examId: number | undefined,
  classroomId: number | undefined,
  runId: number | undefined,
) {
  return useQuery({
    queryKey: classAnalysisAgentKeys.run(examId ?? -1, classroomId ?? -1, runId ?? -1),
    queryFn: () => getClassAnalysisAgentRun(examId!, classroomId!, runId!),
    enabled: examId !== undefined && classroomId !== undefined && runId !== undefined,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'PENDING' || status === 'RUNNING') return 2000
      return false
    },
  })
}

export function useLatestClassInsight(examId: number | undefined, classroomId: number | undefined) {
  return useQuery({
    queryKey: classAnalysisAgentKeys.latestInsight(examId ?? -1, classroomId ?? -1),
    queryFn: () => getLatestClassInsight(examId!, classroomId!),
    enabled: examId !== undefined && classroomId !== undefined,
    staleTime: 30_000,
  })
}
