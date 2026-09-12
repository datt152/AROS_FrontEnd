import { BookmarkPlus, FileCode2, FileScan, Play, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { omrSessionsPath, ROUTES } from '../../../routes/routes.config'
import type { ClassroomOption, ExamItem, QuestionPickItem } from '../types/exam.types'
import {
  EXAM_MODE_BADGE_CLASS,
  EXAM_MODE_LABEL,
  EXAM_STATUS_BADGE_CLASS,
  EXAM_STATUS_LABEL,
  QUESTION_TYPE_LABEL,
  canOpenExam,
  formatExamDate,
  formatExamSchedule,
  getOpenExamBlockReason,
} from '../types/exam.types'

type DetailTab = 'info' | 'questions' | 'classrooms' | 'versions'

type ExamDetailPanelProps = {
  exam: ExamItem
  classroomOptions: ClassroomOption[]
  questionOptions: QuestionPickItem[]
  questionsLoading?: boolean
  isSavingAsTemplate?: boolean
  saveAsTemplateError?: string | null
  onClose: () => void
  onAssignClassrooms: () => void
  onGenerateVersions: () => void
  onOpenExam: () => void
  onPreviewVersion: (versionCode: string) => void
  onSaveAsTemplate: () => void
}

export function ExamDetailPanel({
  exam,
  classroomOptions,
  questionOptions,
  questionsLoading = false,
  isSavingAsTemplate = false,
  saveAsTemplateError = null,
  onClose,
  onAssignClassrooms,
  onGenerateVersions,
  onOpenExam,
  onPreviewVersion,
  onSaveAsTemplate,
}: ExamDetailPanelProps) {
  const [tab, setTab] = useState<DetailTab>('info')
  const readiness = canOpenExam(exam)
  const openBlockReason = getOpenExamBlockReason(exam)
  const versionCodes = exam.versionCodes ?? []

  const assignedClassrooms = useMemo(
    () => classroomOptions.filter((classroom) => (exam.classroomIds ?? []).includes(classroom.id)),
    [classroomOptions, exam.classroomIds],
  )

  const examQuestions = useMemo(() => {
    if (exam.questions && exam.questions.length > 0) return exam.questions

    const ids = exam.questionIds ?? []
    if (ids.length === 0) return []

    const byId = new Map(questionOptions.map((question) => [question.questionId, question]))
    return ids
      .map((id) => byId.get(id))
      .filter((question): question is QuestionPickItem => question !== undefined)
  }, [exam.questions, exam.questionIds, questionOptions])

  const missingQuestionCount = Math.max(
    0,
    (exam.questionIds?.length ?? exam.totalQuestions ?? 0) - examQuestions.length,
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
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Chi tiết đề thi</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{exam.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${EXAM_STATUS_BADGE_CLASS[exam.status]}`}>
                  {EXAM_STATUS_LABEL[exam.status]}
                </span>
                <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${EXAM_MODE_BADGE_CLASS[exam.examMode]}`}>
                  {EXAM_MODE_LABEL[exam.examMode]}
                </span>
                {exam.sourceTemplateId ? (
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
            <span className={readiness.hasClassrooms ? 'font-medium text-emerald-700' : 'text-slate-500'}>
              {readiness.hasClassrooms ? 'Đã giao lớp ✓' : 'Chưa giao lớp'}
            </span>
            <span className="text-slate-300">·</span>
            <span className={readiness.hasVersions ? 'font-medium text-emerald-700' : 'text-slate-500'}>
              {readiness.hasVersions ? 'Đã có mã đề ✓' : 'Chưa có mã đề'}
            </span>
            <span className="text-slate-300">·</span>
            <span
              className={
                exam.status === 'ONGOING' || exam.status === 'UPCOMING'
                  ? 'font-medium text-emerald-700'
                  : 'text-slate-500'
              }
            >
              {exam.status === 'ONGOING' || exam.status === 'UPCOMING' ? 'Đã mở thi ✓' : 'Chưa mở thi'}
            </span>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 rounded-t-xl px-3 py-2 text-sm font-medium transition ${tab === item.id
                ? 'bg-white text-blue-700 shadow-[inset_0_-2px_0_0_#2563eb]'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {tab === 'info' ? (
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Môn học</p>
                <p className="mt-0.5 font-medium text-slate-900">{exam.subjectName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Thời gian</p>
                <p className="mt-0.5 font-medium text-slate-900">{exam.duration} phút</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Số câu</p>
                <p className="mt-0.5 font-medium text-slate-900">{exam.totalQuestions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Thang điểm</p>
                <p className="mt-0.5 font-medium text-slate-900">{exam.maxScore}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Lịch thi</p>
                <p className="mt-0.5 font-medium text-slate-900">{formatExamSchedule(exam.startAt, exam.endAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Ngày tạo</p>
                <p className="mt-0.5 font-medium text-slate-900">{formatExamDate(exam.createdAt)}</p>
              </div>
              {exam.config ? (
                <div className="col-span-2 space-y-1 border-t border-slate-200 pt-3 text-xs text-slate-600">
                  <p>Xáo câu hỏi: {exam.config.shuffleQuestions ? 'Có' : 'Không'}</p>
                  <p>Xáo đáp án: {exam.config.shuffleAnswers ? 'Có' : 'Không'}</p>
                  <p>Hiện điểm sau thi: {exam.config.showScoreToStudent ? 'Có' : 'Không'}</p>
                  <p>Số đề in: {exam.config.paperCount ?? 1}</p>
                  <p>
                    Học kỳ {exam.config.semester ?? '—'} · Năm học {exam.config.academicYear ?? '—'}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'questions' ? (
            questionsLoading ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Đang tải câu hỏi...
              </p>
            ) : examQuestions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                {exam.totalQuestions > 0 || (exam.questionIds?.length ?? 0) > 0
                  ? `Đề có ${exam.totalQuestions || exam.questionIds?.length} câu. Hãy tạo mã đề trước để xem danh sách câu hỏi.`
                  : 'Chưa có câu hỏi gắn với đề.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {examQuestions.map((question, index) => (
                  <li key={question.questionId} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu {index + 1}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{question.content}</p>
                    <p className="mt-1 text-xs text-slate-500">{QUESTION_TYPE_LABEL[question.type]}</p>
                  </li>
                ))}
                {missingQuestionCount > 0 ? (
                  <li className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Thiếu {missingQuestionCount} câu so với danh sách ID (không khớp ngân hàng câu hỏi đã tải).
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
                {exam.status === 'DRAFT' ? (
                  <Button variant="secondary" className="h-9" onClick={onAssignClassrooms}>
                    <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Chọn lớp
                  </Button>
                ) : null}
              </div>
              {assignedClassrooms.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  Chưa giao lớp — Chọn lớp để học sinh làm bài.
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

                {exam.status === 'DRAFT' ? (
                  <Button variant="secondary" className="h-9" onClick={onGenerateVersions}>
                    <FileCode2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Sinh mã đề
                  </Button>
                ) : null}
              </div>
              {versionCodes.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có mã đề — Sinh mã để chống gian lận.
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

        {exam.status === 'DRAFT' ? (
          <div className="space-y-2 border-t border-slate-200 px-5 py-4">
            <span title={openBlockReason ?? undefined} className="block">
              <Button className="w-full" disabled={!readiness.ready} onClick={onOpenExam}>
                <Play className="h-4 w-4" strokeWidth={1.75} />
                Mở thi
              </Button>
            </span>
            {!readiness.ready ? <p className="text-center text-xs text-slate-500">{openBlockReason}</p> : null}
            {exam.examMode === 'OMR_PAPER' ? (
              <Link
                to={omrSessionsPath(exam.id)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <FileScan className="h-4 w-4" strokeWidth={1.75} />
                Phiên chấm OMR
              </Link>
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
          </div>
        ) : (
          <div className="space-y-2 border-t border-slate-200 px-5 py-4">
            {exam.examMode === 'OMR_PAPER' ? (
              <Link
                to={omrSessionsPath(exam.id)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-emerald-700"
              >
                <FileScan className="h-4 w-4" strokeWidth={1.75} />
                Phiên chấm OMR
              </Link>
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
        )}
      </aside>
    </div>
  )
}
