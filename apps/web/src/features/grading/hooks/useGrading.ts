import { useQuery } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import { getExamGrading, getSubmissionDetail } from '../api/grading.api'

export const gradingKeys = {
  all: ['grading'] as const,
  sheets: () => [...gradingKeys.all, 'sheet'] as const,
  sheet: (examId: number, classroomId: number) =>
    [...gradingKeys.sheets(), examId, classroomId] as const,
  submissions: () => [...gradingKeys.all, 'submission'] as const,
  submission: (submissionId: number) => [...gradingKeys.submissions(), submissionId] as const,
}

export function useExamGrading(examId: number | undefined, classroomId: number | undefined) {
  return useQuery({
    queryKey: gradingKeys.sheet(examId ?? -1, classroomId ?? -1),
    queryFn: () => getExamGrading(examId!, classroomId!),
    enabled: examId !== undefined && classroomId !== undefined,
    staleTime: STALE_TIME.detail,
  })
}

export function useSubmissionDetail(submissionId: number | undefined) {
  return useQuery({
    queryKey: gradingKeys.submission(submissionId ?? -1),
    queryFn: () => getSubmissionDetail(submissionId!),
    enabled: submissionId !== undefined,
    staleTime: STALE_TIME.detail,
  })
}
