import { useQuery } from '@tanstack/react-query'

import { getMySubmissions } from '@aros/shared/features/submissions/api/submissions.api'

export const submissionKeys = {
  mySubmissions: ['submissions', 'my'] as const,
}

export function useMySubmissions() {
  return useQuery({
    queryKey: submissionKeys.mySubmissions,
    queryFn: () => getMySubmissions(),
    staleTime: 30_000,
  })
}
