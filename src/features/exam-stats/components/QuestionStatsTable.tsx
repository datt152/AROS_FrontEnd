import {
  Table,
  TableBody,
  TableCell,
  TableCol,
  TableColGroup,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/Table'
import type { QuestionStatItem } from '../types/examStats.types'
import { formatCorrectRate, isHardQuestion } from '../types/examStats.types'

type QuestionStatsTableProps = {
  items: QuestionStatItem[]
  highlightedQuestionId: number | null
  onHighlight: (questionId: number) => void
}

export function QuestionStatsTable({ items, highlightedQuestionId, onHighlight }: QuestionStatsTableProps) {
  const sorted = [...items].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">Chưa có thống kê câu hỏi</p>
        <p className="mt-1 text-sm text-slate-500">Danh sách tỉ lệ đúng sẽ hiện khi đề có dữ liệu câu hỏi.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-slate-900">Tỉ lệ đúng theo câu</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Câu có tỉ lệ đúng dưới 50% được đánh dấu khó. Bấm một dòng để highlight.
        </p>
      </div>

      <div className="divide-y divide-slate-200 md:hidden">
        {sorted.map((item) => {
          const hard = isHardQuestion(item.correctRate)
          const selected = highlightedQuestionId === item.questionId
          const ratePercent =
            item.correctRate === null || item.correctRate === undefined
              ? null
              : Math.round(item.correctRate * 100)

          return (
            <button
              key={item.questionId}
              type="button"
              onClick={() => onHighlight(item.questionId)}
              className={`w-full space-y-2 px-4 py-3 text-left ${selected ? 'bg-blue-50' : 'bg-white'} ${hard ? 'border-l-4 border-l-amber-400' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">
                  <span className="mr-2 text-slate-400">#{item.order}</span>
                  {item.content}
                </p>
                <span
                  className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums ${
                    hard ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {formatCorrectRate(item.correctRate)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Điểm thô {item.rawPoint} · Đúng {item.correctCount}/{item.answeredCount}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${hard ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${ratePercent ?? 0}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableColGroup>
            <TableCol width="3.5rem" />
            <TableCol />
            <TableCol width="5.5rem" />
            <TableCol width="7.5rem" />
            <TableCol width="12rem" />
          </TableColGroup>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead>#</TableHead>
              <TableHead align="left">Nội dung</TableHead>
              <TableHead>Điểm thô</TableHead>
              <TableHead>Đúng / Trả lời</TableHead>
              <TableHead align="left">Tỉ lệ đúng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => {
              const hard = isHardQuestion(item.correctRate)
              const selected = highlightedQuestionId === item.questionId
              const ratePercent =
                item.correctRate === null || item.correctRate === undefined
                  ? null
                  : Math.round(item.correctRate * 100)

              return (
                <TableRow
                  key={item.questionId}
                  className={`cursor-pointer ${selected ? 'bg-blue-50 hover:bg-blue-50' : ''} ${hard ? 'bg-amber-50/40' : ''}`}
                  onClick={() => onHighlight(item.questionId)}
                >
                  <TableCell className="text-center tabular-nums text-slate-500">{item.order}</TableCell>
                  <TableCell align="left">
                    <p className="line-clamp-2 max-w-xl text-sm text-slate-800">{item.content}</p>
                    {hard ? (
                      <span className="mt-1 inline-block text-[11px] font-medium uppercase tracking-wider text-amber-700">
                        Câu khó
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{item.rawPoint}</TableCell>
                  <TableCell className="text-center tabular-nums text-slate-700">
                    {item.correctCount}/{item.answeredCount}
                  </TableCell>
                  <TableCell align="left">
                    <div className="flex min-w-[9rem] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${hard ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${ratePercent ?? 0}%` }}
                        />
                      </div>
                      <span
                        className={`w-10 shrink-0 text-right text-xs font-semibold tabular-nums ${
                          hard ? 'text-amber-800' : 'text-slate-700'
                        }`}
                      >
                        {formatCorrectRate(item.correctRate)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
