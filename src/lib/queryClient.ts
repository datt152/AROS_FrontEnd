import { QueryClient } from '@tanstack/react-query'

import { STALE_TIME } from './queryStaleTime'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      /** Fallback nếu hook không set staleTime riêng */
      staleTime: STALE_TIME.list,
    },
  },
})
