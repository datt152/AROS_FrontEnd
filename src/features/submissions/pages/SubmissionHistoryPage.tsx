import { useMemo, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { Input } from '../../../components/ui/Input'
import { getApiErrorMessage } from '../../../lib/apiError'
import { SubmissionHistoryCard } from '../components/SubmissionHistoryCard'
import { SubmissionHistorySkeleton } from '../components/SubmissionHistorySkeleton'
import { useMySubmissions } from '../hooks/useSubmissions'
import type { PurposeFilter } from '../types/submission.types'

const PURPOSE_TABS: { value: PurposeFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'EXAM', label: 'Bài thi' },
  { value: 'PRACTICE', label: 'Luyện tập' },
]

function parseExamIdParam(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function SubmissionHistoryPage() {
  const [searchParams] = useSearchParams()
  const examId = parseExamIdParam(searchParams.get('examId'))
  const [purposeFilter, setPurposeFilter] = useState<PurposeFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const submissionsQuery = useMySubmissions(examId ? { examId } : undefined)

  const filteredItems = useMemo(() => {
    const items = submissionsQuery.data ?? []
    const keyword = searchQuery.trim().toLowerCase()
    return items.filter((item) => {
      if (purposeFilter !== 'ALL' && item.purpose !== purposeFilter) return false
      if (keyword) {
        const haystack = [item.examTitle, item.versionCode ?? ''].join(' ').toLowerCase()
        if (!haystack.includes(keyword)) return false
      }
      return true
    })
  }, [purposeFilter, searchQuery, submissionsQuery.data])

  const inProgressItems = filteredItems.filter((item) => item.status === 'IN_PROGRESS')
  const otherItems = filteredItems.filter((item) => item.status !== 'IN_PROGRESS')

  const emptyTitle =
    submissionsQuery.isSuccess && (submissionsQuery.data?.length ?? 0) === 0
      ? 'Chưa có lịch sử làm bài'
      : searchQuery.trim()
        ? 'Không tìm thấy bài phù hợp'
        : 'Không có bài thi / luyện tập nào'

  const emptyDescription = examId
    ? 'Chưa có lần làm nào cho đề này.'
    : searchQuery.trim()
      ? 'Thử đổi từ khóa tìm kiếm hoặc bộ lọc.'
      : purposeFilter === 'ALL'
        ? 'Các lần làm bài thi và luyện tập của bạn sẽ hiện ở đây.'
        : purposeFilter === 'EXAM'
          ? 'Chưa có lịch sử bài thi.'
          : 'Chưa có lịch sử luyện tập.'

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Lịch sử</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Lịch sử làm bài</h1>
          <p className="mt-1 text-sm text-slate-500">
            {examId ? `Đang lọc theo đề #${examId}` : 'Tất cả bài thi và luyện tập bạn đã làm.'}
          </p>
        </div>

        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={submissionsQuery.isFetching}
          onClick={() => void submissionsQuery.refetch()}
        >
          <RefreshCw className={`h-4 w-4 ${submissionsQuery.isFetching ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PURPOSE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setPurposeFilter(tab.value)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
              purposeFilter === tab.value
                ? 'border-blue-300 bg-blue-50 text-blue-800'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchQuery}
          placeholder="Tìm theo tên bài thi / luyện tập..."
          className="pl-9"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {submissionsQuery.isLoading ? <SubmissionHistorySkeleton /> : null}

      {submissionsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(submissionsQuery.error, 'Không thể tải lịch sử làm bài')}
          action={
            <Button variant="secondary" onClick={() => void submissionsQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {submissionsQuery.isSuccess && filteredItems.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}

      {submissionsQuery.isSuccess && filteredItems.length > 0 ? (
        <div className="space-y-6">
          {inProgressItems.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Đang làm dở</p>
              {inProgressItems.map((item) => (
                <SubmissionHistoryCard key={item.submissionId} item={item} />
              ))}
            </div>
          ) : null}

          {otherItems.length > 0 ? (
            <div className="space-y-3">
              {inProgressItems.length > 0 ? (
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đã nộp / hết giờ</p>
              ) : null}
              {otherItems.map((item) => (
                <SubmissionHistoryCard key={item.submissionId} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
