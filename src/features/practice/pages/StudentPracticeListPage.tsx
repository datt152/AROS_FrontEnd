import { EmptyState } from '../../../components/ui/EmptyState'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../../routes/routes.config'
import { MOCK_PRACTICES } from '../types/practice.types'
import { formatMaxAttempts } from '../types/practice.types'

/** Skeleton — danh sách luyện tập SV. Chưa có API “đề của tôi”; mock deep-link bằng examId. */
export function StudentPracticeListPage() {
  const openPractices = MOCK_PRACTICES.filter((item) => item.status === 'ONGOING' || item.status === 'UPCOMING')

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Luyện tập</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bài luyện tập</h1>
        <p className="mt-1 text-sm text-slate-500">
          Danh sách tạm từ mock (thiếu API đề giao cho SV). Bấm vào bài để làm thử.
        </p>
      </div>

      {openPractices.length === 0 ? (
        <EmptyState title="Chưa có bài luyện tập" description="Khi giáo viên mở luyện tập, bài sẽ hiện tại đây." />
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {openPractices.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {item.subjectName} · {formatMaxAttempts(item.config.maxAttempts)} ·{' '}
                  {item.config.timeLimitEnabled ? `${item.duration} phút` : 'Không giới hạn giờ'}
                </p>
              </div>
              <Link
                to={ROUTES.student.takePractice.replace(':practiceId', String(item.id))}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 px-4 text-sm font-medium text-white"
              >
                Làm bài
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
