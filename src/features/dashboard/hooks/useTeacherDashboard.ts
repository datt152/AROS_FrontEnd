import { useQuery } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  getTeacherDashboard,
  type GetTeacherDashboardParams,
} from '../api/dashboard.api'

export const dashboardKeys = {
  all: ['teacher-dashboard'] as const,
  detail: (params: GetTeacherDashboardParams) =>
    [...dashboardKeys.all, params.from, params.to] as const,
}

export function useTeacherDashboard(params: GetTeacherDashboardParams) {
  return useQuery({
    queryKey: dashboardKeys.detail(params),
    queryFn: () => getTeacherDashboard(params),
    staleTime: STALE_TIME.list,
    enabled: Boolean(params.from && params.to),
    placeholderData: (previous) => previous,
  })
}
