import { useQuery } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import { getMySubmissionDetail, getMySubmissions, type GetMySubmissionsParams } from '../api/submissions.api'

export const submissionKeys = {
  all: ['submissions'] as const,
  mine: () => [...submissionKeys.all, 'mine'] as const,
  myList: (params?: GetMySubmissionsParams) => [...submissionKeys.mine(), params ?? {}] as const,
  details: () => [...submissionKeys.all, 'detail'] as const,
  detail: (submissionId: number) => [...submissionKeys.details(), submissionId] as const,
}

export function useMySubmissions(params?: GetMySubmissionsParams) {
  return useQuery({
    queryKey: submissionKeys.myList(params),
    queryFn: () => getMySubmissions(params),
    staleTime: STALE_TIME.list,
  })
}

export function useMySubmissionDetail(submissionId: number | undefined) {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId ?? -1),
    queryFn: () => getMySubmissionDetail(submissionId!),
    staleTime: STALE_TIME.detail,
    enabled: submissionId !== undefined && submissionId > 0,
  })
}
