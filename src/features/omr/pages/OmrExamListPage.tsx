import { ArrowRight, FileScan, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '../../../components/ui/EmptyState'
import { omrSessionsPath } from '../../../routes/routes.config'
import { MOCK_OMR_EXAMS } from '../lib/omr.mock'

export function OmrExamListPage() {
  const exams = MOCK_OMR_EXAMS

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Chấm OMR</h1>
        <p className="text-sm text-slate-500">
          Chọn đề thi giấy (OMR) để tạo phiên chấm và tải phiếu trả lời. Dữ liệu đang dùng mock — gắn API sau.
        </p>
      </header>

      {exams.length === 0 ? (
        <EmptyState
          title="Chưa có đề OMR"
          description="Tạo đề với hình thức OMR / Giấy trong Quản lý bài thi trước."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => {
            const ready = exam.versionCodes.length > 0 && exam.classroomCount > 0
            return (
              <li
                key={exam.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">{exam.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{exam.subjectName}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                    OMR
                  </span>
                </div>

                <dl className="mb-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-xs text-slate-400">Câu hỏi</dt>
                    <dd className="font-medium text-slate-800">{exam.totalQuestions}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-xs text-slate-400">Lớp gán</dt>
                    <dd className="font-medium text-slate-800">{exam.classroomCount}</dd>
                  </div>
                  <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="mb-1 flex items-center gap-1 text-xs text-slate-400">
                      <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Mã đề
                    </dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {exam.versionCodes.length === 0 ? (
                        <span className="text-slate-500">Chưa tạo mã đề</span>
                      ) : (
                        exam.versionCodes.map((code) => (
                          <span
                            key={code}
                            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700"
                          >
                            {code}
                          </span>
                        ))
                      )}
                    </dd>
                  </div>
                </dl>

                {!ready ? (
                  <p className="mb-3 text-xs text-amber-700">
                    Cần có mã đề và ít nhất một lớp trước khi mở phiên chấm.
                  </p>
                ) : null}

                <Link
                  to={omrSessionsPath(exam.id)}
                  className={`mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                    ready
                      ? 'bg-linear-to-r from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-emerald-700'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileScan className="h-4 w-4" strokeWidth={1.75} />
                  Phiên chấm
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
