import { BookmarkPlus, FileCode2, Lock, Play, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../routes/routes.config'
import { QUESTION_TYPE_LABEL, formatExamDate, formatExamSchedule } from '../../exams/types/exam.types'
import type {
  PracticeClassroomOption,
  PracticeItem,
  PracticeQuestionOption,
} from '../types/practice.types'
import { formatMaxAttempts, formatTimeLimit } from '../types/practice.types'
import { PracticeStatusBadge } from './PracticeStatusBadge'

type DetailTab = 'info' | 'questions' | 'classrooms' | 'versions'

type PracticeDetailPanelProps = {
  item: PracticeItem
  classroomOptions: PracticeClassroomOption[]
  questionOptions: PracticeQuestionOption[]
  questionsLoading?: boolean
  isSavingAsTemplate?: boolean
  saveAsTemplateError?: string | null
  onClose: () => void
  onAssignClassrooms: () => void
  onGenerateVersions: () => void
  onOpenPractice: () => void
  onClosePractice: () => void
  onPreviewVersion: (versionCode: string) => void
  onSaveAsTemplate: () => void
}

export function PracticeDetailPanel({
  item,
  classroomOptions,
  questionOptions,
  questionsLoading = false,
  isSavingAsTemplate = false,
  saveAsTemplateError = null,
  onClose,
  onAssignClassrooms,
  onGenerateVersions,
  onOpenPractice,
  onClosePractice,
  onPreviewVersion,
  onSaveAsTemplate,
}: PracticeDetailPanelProps) {
  const [tab, setTab] = useState<DetailTab>('info')
  const versionCodes = item.versionCodes ?? []
  const hasClassrooms = item.classroomIds.length > 0
  const hasVersions = versionCodes.length > 0
  const isDraft = item.status === 'DRAFT'
  const isOpen = item.status === 'ONGOING' || item.status === 'UPCOMING'
  const canOpen = isDraft && hasClassrooms && hasVersions
  const openBlockReason = !hasClassrooms
    ? 'Cần giao ít nhất 1 lớp trước'
    : !hasVersions
      ? 'Cần sinh mã đề trước'
      : null

  const assignedClassrooms = useMemo(
    () => classroomOptions.filter((classroom) => item.classroomIds.includes(classroom.id)),
    [classroomOptions, item.classroomIds],
  )

  const practiceQuestions = useMemo(() => {
    if (item.questions && item.questions.length > 0) return item.questions

    const ids = item.questionIds ?? []
    if (ids.length === 0) return []
    const byId = new Map(questionOptions.map((question) => [question.questionId, question]))
    return ids
      .map((id) => byId.get(id))
      .filter((question): question is PracticeQuestionOption => question !== undefined)
  }, [item.questions, item.questionIds, questionOptions])

  const missingQuestionCount = Math.max(
    0,
    (item.questionIds?.length ?? item.totalQuestions ?? 0) - practiceQuestions.length,
  )

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'info', label: 'Thông tin' },
    { id: 'questions', label: 'Câu hỏi' },
    { id: 'classrooms', label: 'Lớp giao' },
    { id: 'versions', label: 'Mã đề' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Đóng bảng" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Chi tiết luyện tập</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{item.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <PracticeStatusBadge status={item.status} />
                {item.sourceTemplateId ? (
                  <span className="inline-flex rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                    Từ thư viện
                  </span>
                ) : null}
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Đóng">
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs">
            <span className={hasClassrooms ? 'font-medium text-emerald-700' : 'text-slate-500'}>
              {hasClassrooms ? 'Đã giao lớp ✓' : 'Chưa giao lớp'}
            </span>
            <span className="text-slate-300">·</span>
            <span className={hasVersions ? 'font-medium text-emerald-700' : 'text-slate-500'}>
              {hasVersions ? 'Đã có mã đề ✓' : 'Chưa có mã đề'}
            </span>
            <span className="text-slate-300">·</span>
            <span className={isOpen ? 'font-medium text-emerald-700' : 'text-slate-500'}>
              {isOpen ? 'Đã mở luyện tập ✓' : 'Chưa mở'}
            </span>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setTab(tabItem.id)}
              className={`shrink-0 rounded-t-xl px-3 py-2 text-sm font-medium transition ${
                tab === tabItem.id
                  ? 'bg-white text-blue-700 shadow-[inset_0_-2px_0_0_#2563eb]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {tab === 'info' ? (
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Môn học</p>
                <p className="mt-0.5 font-medium text-slate-900">{item.subjectName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Giới hạn giờ</p>
                <p className="mt-0.5 font-medium text-slate-900">
                  {formatTimeLimit(item.config.timeLimitEnabled, item.duration)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Số câu</p>
                <p className="mt-0.5 font-medium text-slate-900">{item.totalQuestions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Thang điểm</p>
                <p className="mt-0.5 font-medium text-slate-900">{item.maxScore}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Số lần làm</p>
                <p className="mt-0.5 font-medium text-slate-900">
                  {formatMaxAttempts(item.config.maxAttempts)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Hiện điểm SV</p>
                <p className="mt-0.5 font-medium text-slate-900">Có (cố định)</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Lịch mở</p>
                <p className="mt-0.5 font-medium text-slate-900">
                  {formatExamSchedule(item.startAt, item.endAt)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Ngày tạo</p>
                <p className="mt-0.5 font-medium text-slate-900">{formatExamDate(item.createdAt)}</p>
              </div>
              <div className="col-span-2 space-y-1 border-t border-slate-200 pt-3 text-xs text-slate-600">
                <p>Xáo câu hỏi: {item.config.shuffleQuestions ? 'Có' : 'Không'}</p>
                <p>Xáo đáp án: {item.config.shuffleAnswers ? 'Có' : 'Không'}</p>
                <p>
                  Học kỳ {item.config.semester || '—'} · Năm học {item.config.academicYear || '—'}
                </p>
              </div>
            </div>
          ) : null}

          {tab === 'questions' ? (
            questionsLoading ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Đang tải câu hỏi...
              </p>
            ) : practiceQuestions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                {item.totalQuestions > 0 || (item.questionIds?.length ?? 0) > 0
                  ? `Bài có ${item.totalQuestions || item.questionIds.length} câu. Hãy tạo mã đề để xem trước nội dung.`
                  : 'Chưa có câu hỏi gắn với bài luyện tập.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {practiceQuestions.map((question, index) => (
                  <li key={question.questionId} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Câu {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{question.content}</p>
                    <p className="mt-1 text-xs text-slate-500">{QUESTION_TYPE_LABEL[question.type]}</p>
                  </li>
                ))}
                {missingQuestionCount > 0 ? (
                  <li className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Thiếu {missingQuestionCount} câu so với danh sách ID (không khớp ngân hàng đã tải).
                  </li>
                ) : null}
              </ul>
            )
          ) : null}

          {tab === 'classrooms' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">
                  Lớp được giao <span className="text-slate-400">({assignedClassrooms.length})</span>
                </p>
                {isDraft ? (
                  <Button variant="secondary" className="h-9" onClick={onAssignClassrooms}>
                    <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Chọn lớp
                  </Button>
                ) : null}
              </div>
              {assignedClassrooms.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  Chưa giao lớp — Chọn lớp để sinh viên luyện tập.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                  {assignedClassrooms.map((classroom) => (
                    <li key={classroom.id} className="px-4 py-3 text-sm font-medium text-slate-900">
                      {classroom.className}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {tab === 'versions' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">
                  Mã đề <span className="text-slate-400">({versionCodes.length})</span>
                </p>
                {isDraft ? (
                  <Button variant="secondary" className="h-9" onClick={onGenerateVersions}>
                    <FileCode2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Sinh mã đề
                  </Button>
                ) : null}
              </div>
              {versionCodes.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có mã đề — Sinh mã trước khi mở luyện tập.
                </p>
              ) : (
                <>
                  <ul className="flex flex-wrap gap-2">
                    {versionCodes.map((code) => (
                      <li key={code}>
                        <button
                          type="button"
                          onClick={() => onPreviewVersion(code)}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                        >
                          {code}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-400">Nhấn mã đề để xem trước (không hiện đáp án đúng).</p>
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-slate-200 px-5 py-4">
          {isDraft ? (
            <>
              <span title={openBlockReason ?? undefined} className="block">
                <Button className="w-full" disabled={!canOpen} onClick={onOpenPractice}>
                  <Play className="h-4 w-4" strokeWidth={1.75} />
                  Mở luyện tập
                </Button>
              </span>
              {!canOpen && openBlockReason ? (
                <p className="text-center text-xs text-slate-500">{openBlockReason}</p>
              ) : null}
            </>
          ) : null}

          {isOpen ? (
            <Button variant="secondary" className="w-full" onClick={onClosePractice}>
              <Lock className="h-4 w-4" strokeWidth={1.75} />
              Đóng bài
            </Button>
          ) : null}

          <Button
            variant="secondary"
            className="w-full"
            disabled={isSavingAsTemplate}
            onClick={onSaveAsTemplate}
          >
            <BookmarkPlus className="h-4 w-4" strokeWidth={1.75} />
            {isSavingAsTemplate ? 'Đang lưu...' : 'Lưu thành template'}
          </Button>
          {saveAsTemplateError ? (
            <p className="text-center text-xs text-red-600">{saveAsTemplateError}</p>
          ) : null}
          <p className="text-center text-xs text-slate-500">
            Xem tại{' '}
            <Link to={ROUTES.teacher.examTemplates} className="font-medium text-blue-600 hover:text-blue-700">
              Thư viện đề
            </Link>
          </p>
        </div>
      </aside>
    </div>
  )
}
