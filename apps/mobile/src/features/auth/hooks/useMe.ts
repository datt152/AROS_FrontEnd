import { useQuery } from '@tanstack/react-query'

import { getMe } from '@aros/shared/features/auth/api/users.api'

export const meKeys = {
  all: ['users', 'me'] as const,
  detail: () => [...meKeys.all, 'detail'] as const,
}

export function useMe() {
  return useQuery({
    queryKey: meKeys.detail(),
    queryFn: getMe,
    staleTime: 5 * 60_000,
    retry: false,
  })
}
