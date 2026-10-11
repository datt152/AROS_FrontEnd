import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import { getMySubmissionDetail, getMySubmissions, type GetMySubmissionsParams } from '../api/submissions.api'
import type { ExamPurpose, StudentSubmissionItem, SubmissionDetailLocationState } from '../types/submission.types'

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

export function useResolvedSubmissionPurpose(
  submissionId: number | undefined,
  apiPurpose: ExamPurpose | undefined,
) {
  const location = useLocation()
  const queryClient = useQueryClient()

  return useMemo(() => {
    const fromState = (location.state as SubmissionDetailLocationState | null)?.purpose
    if (fromState) return fromState
    if (apiPurpose === 'PRACTICE') return 'PRACTICE'

    const caches = queryClient.getQueriesData<StudentSubmissionItem[]>({
      queryKey: submissionKeys.mine(),
    })
    for (const [, data] of caches) {
      const item = data?.find((entry) => entry.submissionId === submissionId)
      if (item?.purpose === 'PRACTICE') return 'PRACTICE'
    }

    return apiPurpose ?? 'EXAM'
  }, [apiPurpose, location.state, queryClient, submissionId])
}
