import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { ROUTES } from '../../../routes/routes.config'
import type { TakeExamLocationState } from '../types/studentExam.types'
import { useSubmitExam, useTakeExam } from '../hooks/useExams'
import {
  answersToSubmitPayload,
  mapExamTakeError,
  type ExamTakeItem,
  type SubmissionResultItem,
} from '../types/exam.types'

function readExamIdFromState(state: unknown): number | undefined {
  if (!state || typeof state !== 'object') return undefined
  const examId = (state as TakeExamLocationState).examId
  return typeof examId === 'number' && Number.isFinite(examId) && examId > 0 ? examId : undefined
}

export function ExamTakePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const examId = readExamIdFromState(location.state)

  const [result, setResult] = useState<SubmissionResultItem | null>(null)
  const [submittedExam, setSubmittedExam] = useState<ExamTakeItem | null>(null)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  const takeQuery = useTakeExam(examId, !result)
  const submitExam = useSubmitExam()

  const exam = submittedExam ?? takeQuery.data

  const deadline = useMemo(() => {
    if (!exam) return 0
    return new Date(exam.startTime).getTime() + exam.duration * 60 * 1000
  }, [exam])

  useEffect(() => {
    if (result || !exam || exam.timeLimitEnabled === false) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [result, exam])

  const secondsLeft = exam ? Math.max(0, Math.floor((deadline - now) / 1000)) : 0
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  function setSingleAnswer(questionId: number, label: string) {
    setAnswers((current) => ({ ...current, [questionId]: label }))
  }

  function toggleMultiAnswer(questionId: number, label: string) {
    setAnswers((current) => {
      const existing = Array.isArray(current[questionId]) ? (current[questionId] as string[]) : []
      const next = existing.includes(label)
        ? existing.filter((item) => item !== label)
        : [...existing, label]
      return { ...current, [questionId]: next }
    })
  }

  async function handleSubmit() {
    if (!exam) return
    setSubmitError(null)
    try {
      const data = await submitExam.mutateAsync({
        examId: exam.examId,
        versionCode: exam.versionCode,
        answers: answersToSubmitPayload(answers),
      })
      setSubmittedExam(exam)
      setResult(data)
      // Xóa state URL để F5/back không giữ phiên làm bài cũ
      void navigate(ROUTES.student.takeExam, { replace: true, state: null })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể nộp bài')
      setSubmitError(mapExamTakeError(message))
    }
  }

  if (result && exam) {
    const scoreVisible =
      result.scoreVisible !== false && exam.showScoreToStudent !== false

    return (
      <section className="mx-auto max-w-lg space-y-5 py-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Nộp bài</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">Nộp bài thành công</h1>
          <p className="mt-1 text-sm text-slate-600">{exam.title}</p>

          {scoreVisible ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-white px-4 py-5">
              <p className="text-sm text-slate-600">Đây là điểm số của bạn</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                {result.totalScore?.toFixed(2)}/{result.maxScore}
              </p>
              {result.correctQuestions != null && result.totalQuestions != null ? (
                <p className="mt-2 text-sm text-slate-500">
                  Đúng {result.correctQuestions}/{result.totalQuestions} câu
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
              Bài làm của bạn đã được ghi nhận.
            </p>
          )}

        </div>

        <Link to={ROUTES.student.exams} className="block">
          <Button variant="secondary" className="w-full">
            Quay lại bài thi
          </Button>
        </Link>
      </section>
    )
  }

  if (examId === undefined) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState
          title="Chưa chọn bài thi"
          description="Vào làm bài từ danh sách bài thi. Không mở trang này trực tiếp bằng URL."
          action={
            <Link to={ROUTES.student.exams}>
              <Button variant="secondary">Về danh sách bài thi</Button>
            </Link>
          }
        />
      </section>
    )
  }

  if (takeQuery.isLoading) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <Spinner label="Đang tải bài thi..." />
      </section>
    )
  }

  if (takeQuery.isError) {
    const message = mapExamTakeError(getApiErrorMessage(takeQuery.error, 'Không thể vào làm bài'))
    return (
      <section className="mx-auto max-w-lg space-y-4 py-10">
        <EmptyState title="Không thể vào làm bài" description={message} />
        <Link to={ROUTES.student.exams} className="block">
          <Button variant="secondary" className="w-full">
            Quay lại bài thi
          </Button>
        </Link>
      </section>
    )
  }

  if (!exam) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState title="Không thể vào làm bài" description="Không tải được dữ liệu bài thi." />
      </section>
    )
  }

  const timeLimited = exam.timeLimitEnabled !== false
  const canSubmit = !submitExam.isPending && (!timeLimited || secondsLeft > 0)

  return (
    <section className="mx-auto max-w-3xl space-y-5 py-6">
      <div className="sticky top-2 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Làm bài</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{exam.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">Mã đề {exam.versionCode}</p>
        </div>
        {timeLimited ? (
          <div className="rounded-xl bg-slate-900 px-4 py-2 text-center text-white">
            <p className="text-[11px] uppercase tracking-wider text-slate-300">Thời gian còn</p>
            <p className="text-lg font-semibold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
        ) : (
          <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            Không giới hạn giờ
          </span>
        )}
      </div>

      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="space-y-4">
        {exam.questions.map((question, index) => {
          const isMulti = question.type === 'MULTIPLE_CHOICE'
          return (
            <article key={question.questionId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu {index + 1}</p>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {isMulti ? 'Nhiều đáp án' : 'Một đáp án'}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{question.content}</p>
              <ul className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const selected = isMulti
                    ? Array.isArray(answers[question.questionId]) &&
                      (answers[question.questionId] as string[]).includes(option.label)
                    : answers[question.questionId] === option.label

                  return (
                    <li key={option.label}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                          selected
                            ? 'border-blue-300 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type={isMulti ? 'checkbox' : 'radio'}
                          name={`q-${question.questionId}`}
                          checked={selected}
                          onChange={() =>
                            isMulti
                              ? toggleMultiAnswer(question.questionId, option.label)
                              : setSingleAnswer(question.questionId, option.label)
                          }
                          className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600"
                        />
                        <span>
                          <span className="mr-1.5 font-semibold">{option.label}.</span>
                          {option.content}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </div>

      <div className="sticky bottom-4">
        <Button className="w-full shadow-lg" disabled={!canSubmit} onClick={() => void handleSubmit()}>
          {submitExam.isPending ? 'Đang nộp...' : timeLimited && secondsLeft === 0 ? 'Hết giờ' : 'Nộp bài'}
        </Button>
      </div>
    </section>
  )
}
