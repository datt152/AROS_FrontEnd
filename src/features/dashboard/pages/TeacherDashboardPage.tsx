import { useMemo, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { DashboardAgendaPanel } from '../components/DashboardAgendaPanel'
import { DashboardCalendar } from '../components/DashboardCalendar'
import { DashboardStatCards } from '../components/DashboardStatCards'
import { useTeacherDashboard } from '../hooks/useTeacherDashboard'
import {
  getDashboardRangeForAnchor,
  mapStatsToCards,
  toDateKey,
} from '../types/dashboard.types'

export function TeacherDashboardPage() {
  const [anchor, setAnchor] = useState(() => new Date())
  const todayKey = useMemo(() => toDateKey(new Date()), [])

  const range = useMemo(() => getDashboardRangeForAnchor(anchor), [anchor])
  const dashboardQuery = useTeacherDashboard(range)

  const statsCards = useMemo(
    () => (dashboardQuery.data ? mapStatsToCards(dashboardQuery.data.stats) : []),
    [dashboardQuery.data],
  )

  return (
    <section className="space-y-5">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Giáo viên</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bảng điều khiển</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan lớp học, kỳ thi và việc cần xử lý.
          </p>
        </div>

        {dashboardQuery.isLoading ? <Spinner label="Đang tải bảng điều khiển..." /> : null}

        {dashboardQuery.isError ? (
          <ErrorState
            message={getApiErrorMessage(dashboardQuery.error, 'Không thể tải bảng điều khiển')}
            action={
              <Button variant="secondary" onClick={() => void dashboardQuery.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : null}

        {dashboardQuery.isSuccess ? <DashboardStatCards items={statsCards} /> : null}
      </header>

      {dashboardQuery.isSuccess ? (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <DashboardCalendar
              events={dashboardQuery.data.calendarEvents}
              todayKey={todayKey}
              anchor={anchor}
              onAnchorChange={setAnchor}
              isFetching={dashboardQuery.isFetching && !dashboardQuery.isLoading}
            />
          </div>
          <div className="xl:col-span-4">
            <DashboardAgendaPanel
              todos={dashboardQuery.data.todos}
              activities={dashboardQuery.data.activities}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
