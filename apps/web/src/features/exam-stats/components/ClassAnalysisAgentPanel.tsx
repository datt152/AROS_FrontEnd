import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'

import { getApiErrorMessage } from '@aros/shared/api/apiError'
import { Button } from '../../../components/ui/Button'
import {
  useClassAnalysisAgentRun,
  useLatestClassInsight,
  useStartClassAnalysisAgent,
  classAnalysisAgentKeys,
} from '../hooks/useClassAnalysisAgent'
import { parseInsightReport, type AgentRunStatus } from '../types/classAnalysisAgent.types'
import { useQueryClient } from '@tanstack/react-query'

type ClassAnalysisAgentPanelProps = {
  examId: number
  classroomId: number
  submittedCount: number
}

function statusLabel(status: AgentRunStatus | undefined) {
  switch (status) {
    case 'PENDING':
      return 'Đang chờ'
    case 'RUNNING':
      return 'Đang phân tích'
    case 'DONE':
      return 'Hoàn tất'
    case 'FAILED':
      return 'Thất bại'
    default:
      return 'Chưa phân tích'
  }
}

function statusClass(status: AgentRunStatus | undefined) {
  switch (status) {
    case 'PENDING':
    case 'RUNNING':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'DONE':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

export function ClassAnalysisAgentPanel({
  examId,
  classroomId,
  submittedCount,
}: ClassAnalysisAgentPanelProps) {
  const queryClient = useQueryClient()
  const [activeRunId, setActiveRunId] = useState<number | undefined>(undefined)
  const [startError, setStartError] = useState<string | null>(null)

  const startMutation = useStartClassAnalysisAgent()
  const runQuery = useClassAnalysisAgentRun(examId, classroomId, activeRunId)
  const insightQuery = useLatestClassInsight(examId, classroomId)

  const run = runQuery.data
  const isBusy = run?.status === 'PENDING' || run?.status === 'RUNNING' || startMutation.isPending
  useEffect(() => {
    setActiveRunId(undefined)
    setStartError(null)
  }, [examId, classroomId])

  useEffect(() => {
    if (run?.status === 'DONE') {
      void queryClient.invalidateQueries({
        queryKey: classAnalysisAgentKeys.latestInsight(examId, classroomId),
      })
    }
  }, [run?.status, examId, classroomId, queryClient])

  const report = useMemo(() => {
    if (run?.status === 'DONE' && run.finalReport) {
  
      return parseInsightReport(run.finalReport)
    }
    return parseInsightReport(insightQuery.data?.reportJson)
  }, [run, insightQuery.data])
  const hasRun = Boolean(run || report)

const effectiveStatus: AgentRunStatus | undefined = isBusy
  ? run?.status === 'PENDING'
    ? 'PENDING'
    : 'RUNNING'
  : run?.status ?? (report ? 'DONE' : undefined)

const buttonLabel = isBusy
  ? 'Đang chạy...'
  : hasRun
    ? 'Phân tích lại'
    : 'Phân tích kết quả'
  async function handleStart() {
    setStartError(null)
    try {
      const created = await startMutation.mutateAsync({ examId, classroomId })
      setActiveRunId(created.runId)
    } catch (error) {
      setStartError(getApiErrorMessage(error, 'Không thể chạy Agent phân tích'))
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" strokeWidth={2} />
            <h2 className="text-base font-semibold text-slate-900">Phân tích kết quả làm bài bằng AI</h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(effectiveStatus)}`}
            >
              {statusLabel(effectiveStatus)}
            </span>
          </div>
          
        </div>

        <Button
          type="button"
          onClick={() => void handleStart()}
          disabled={isBusy || submittedCount < 1}
          title={submittedCount < 1 ? 'Cần ít nhất 1 bài đã nộp' : undefined}
        >
          {buttonLabel}
        </Button>
      </div>

      {submittedCount < 1 ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Lớp chưa có bài nộp — hãy chờ sinh viên nộp bài rồi bấm nút "Phân tích kết quả".
        </p>
      ) : null}

      {startError ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {startError}
        </p>
      ) : null}

      {run?.status === 'FAILED' && run.errorMessage ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {run.errorMessage}
        </p>
      ) : null}

      {isBusy && (!run || run.steps.length === 0) ? (
        <p className="mt-4 text-sm text-slate-500">Đang tiến hành phân tích, vui lòng chờ trong vài phút.</p>
      ) : null}

      {report ? (
        <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Nhận xét lớp</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {report.summary || '—'}
            </p>
          </div>

          {report.weaknesses.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Điểm yếu</p>
              <ul className="mt-2 space-y-2">
                {report.weaknesses.map((item, index) => (
                  <li
                    key={`${item.order ?? 'w'}-${index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="font-medium text-slate-900">
                      {item.order != null ? `Câu ${item.order}` : `Mục ${index + 1}`}
                    </span>
                    {item.correctRate != null ? (
                      <span className="ml-2 text-xs text-slate-500">
                        đúng {(item.correctRate * 100).toFixed(0)}%
                      </span>
                    ) : null}
                    {item.note ? <p className="mt-1 text-slate-600">{item.note}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {report.suggestions.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Gợi ý giảng dạy</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {report.suggestions.map((item, index) => (
                  <li key={`${index}-${item.slice(0, 24)}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
