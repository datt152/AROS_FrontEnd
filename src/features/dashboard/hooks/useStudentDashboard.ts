import { useQuery } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  getStudentDashboard,
  type GetStudentDashboardParams,
} from '../api/studentDashboard.api'

export type { GetStudentDashboardParams }

export const studentDashboardKeys = {
  all: ['student-dashboard'] as const,
  detail: (params: GetStudentDashboardParams) =>
    [...studentDashboardKeys.all, params.from, params.to] as const,
}

export function useStudentDashboard(params: GetStudentDashboardParams) {
  return useQuery({
    queryKey: studentDashboardKeys.detail(params),
    queryFn: () => getStudentDashboard(params),
    staleTime: STALE_TIME.list,
    enabled: Boolean(params.from && params.to),
    placeholderData: (previous) => previous,
  })
}
