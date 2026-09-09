import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import { getMe, updateMe, updateMyStudentCode } from '../api/users.api'
import type { UpdateMePayload, UpdateStudentCodePayload, UserProfile } from '../types/auth.types'

export const meKeys = {
  all: ['users', 'me'] as const,
  detail: () => [...meKeys.all, 'detail'] as const,
}

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: meKeys.detail(),
    queryFn: getMe,
    staleTime: STALE_TIME.auth,
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useUpdateMyStudentCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateStudentCodePayload) => updateMyStudentCode(payload),
    onSuccess: (profile: UserProfile) => {
      queryClient.setQueryData(meKeys.detail(), profile)
    },
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateMePayload) => updateMe(payload),
    onSuccess: (profile: UserProfile) => {
      queryClient.setQueryData(meKeys.detail(), profile)
    },
  })
}
