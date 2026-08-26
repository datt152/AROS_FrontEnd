import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { useSubmitExam, useTakeExam } from '../../exams/hooks/useExams'
import {
  answersToSubmitPayload,
  mapExamTakeError,
  type SubmissionResultItem,
} from '../../exams/types/exam.types'
import { ROUTES } from '../../../routes/routes.config'
import { PracticeAttemptBadge } from '../components/PracticeAttemptBadge'
import { canRetryPractice } from '../types/practice.types'

export function PracticeTakePage() {
  const { practiceId } = useParams<{ practiceId: string }>()
  const examId = Number(practiceId)
  const takeQuery = useTakeExam(Number.isFinite(examId) && examId > 0 ? examId : undefined)
  const submitExam = useSubmitExam()

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [result, setResult] = useState<SubmissionResultItem | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [takeKey, setTakeKey] = useState(0)

  const exam = takeQuery.data
  const timeLimited = exam?.timeLimitEnabled === true
  const attemptNo = exam?.attemptNo ?? 1
  const maxAttempts = exam?.maxAttempts ?? null

  const deadline = useMemo(() => {
    if (!exam || !timeLimited) return 0
    return new Date(exam.startTime).getTime() + exam.duration * 60 * 1000
  }, [exam, timeLimited])

  useEffect(() => {
    if (result || !exam || !timeLimited) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [result, exam, timeLimited, takeKey])

  const secondsLeft = timeLimited && deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : null

  async function handleSubmit() {
    if (!exam) return
    setSubmitError(null)
    try {
      const data = await submitExam.mutateAsync({
        examId: exam.examId,
        versionCode: exam.versionCode,
        answers: answersToSubmitPayload(answers),
      })
      setResult(data)
    } catch (error) {
      setSubmitError(mapExamTakeError(getApiErrorMessage(error, 'Không thể nộp bài')))
    }
  }

  async function handleRetry() {
    setResult(null)
    setAnswers({})
    setSubmitError(null)
    setTakeKey((value) => value + 1)
    await takeQuery.refetch()
  }

  if (!Number.isFinite(examId) || examId <= 0) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState title="Không tìm thấy bài luyện tập" description="Đường dẫn không hợp lệ." />
      </section>
    )
  }

  if (takeQuery.isLoading) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <Spinner label="Đang tải bài luyện tập..." />
      </section>
    )
  }

  if (takeQuery.isError) {
    const message = mapExamTakeError(getApiErrorMessage(takeQuery.error, 'Không thể vào làm bài'))
    const exhausted = /hết|lượt|attempt/i.test(message)
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState
          title={exhausted ? 'Đã hết lượt làm bài' : 'Không thể vào làm bài'}
          description={message}
          action={
            <Link
              to={ROUTES.student.practice}
              className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700"
            >
              Quay lại danh sách
            </Link>
          }
        />
      </section>
    )
  }

  if (!exam) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState title="Không tải được bài" description="Thử lại sau." />
      </section>
    )
  }

  if (result) {
    const scoreVisible = result.scoreVisible !== false && exam.showScoreToStudent !== false
    const canRetry = canRetryPractice(result.attemptNo ?? attemptNo, maxAttempts)
    return (
      <section className="mx-auto max-w-lg space-y-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Kết quả luyện tập</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            {scoreVisible ? 'Đã nộp bài' : 'Nộp thành công'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{exam.title}</p>
          <div className="mt-3 flex justify-center">
            <PracticeAttemptBadge attemptNo={result.attemptNo ?? attemptNo} maxAttempts={maxAttempts} />
          </div>

          {scoreVisible ? (
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Điểm</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {result.totalScore}/{result.maxScore}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Đúng / Tổng</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {result.correctQuestions}/{result.totalQuestions}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Giáo viên đã tắt hiện điểm. Bài của bạn đã được ghi nhận.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {canRetry ? (
              <Button onClick={() => void handleRetry()} disabled={takeQuery.isFetching}>
                {takeQuery.isFetching ? 'Đang tải...' : 'Làm lại'}
              </Button>
            ) : (
              <p className="text-sm text-slate-500">Bạn đã hết lượt làm lại.</p>
            )}
            <Link
              to={ROUTES.student.practice}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Về danh sách luyện tập
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-5 py-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Luyện tập</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{exam.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PracticeAttemptBadge attemptNo={attemptNo} maxAttempts={maxAttempts} />
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              Mã đề {exam.versionCode}
            </span>
            {!timeLimited ? (
              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                Không giới hạn giờ
              </span>
            ) : null}
          </div>
        </div>
        {timeLimited && secondsLeft !== null ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700">Còn lại</p>
            <p className="text-lg font-semibold tabular-nums text-amber-900">
              {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
              {String(secondsLeft % 60).padStart(2, '0')}
            </p>
          </div>
        ) : null}
      </div>

      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="space-y-4">
        {exam.questions.map((question, index) => {
          const isMulti = question.type === 'MULTIPLE_CHOICE'
          return (
            <div key={question.questionId} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-900">
                Câu {index + 1}. {question.content}
              </p>
              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const selected = answers[question.questionId]
                  const isChecked = isMulti
                    ? Array.isArray(selected) && selected.includes(option.label)
                    : selected === option.label

                  return (
                    <label
                      key={option.label}
                      className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                        isChecked ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type={isMulti ? 'checkbox' : 'radio'}
                        name={`q-${question.questionId}`}
                        checked={isChecked}
                        onChange={() => {
                          if (isMulti) {
                            setAnswers((current) => {
                              const existing = Array.isArray(current[question.questionId])
                                ? (current[question.questionId] as string[])
                                : []
                              const next = existing.includes(option.label)
                                ? existing.filter((item) => item !== option.label)
                                : [...existing, option.label]
                              return { ...current, [question.questionId]: next }
                            })
                          } else {
                            setAnswers((current) => ({ ...current, [question.questionId]: option.label }))
                          }
                        }}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="font-medium text-slate-700">{option.label}.</span> {option.content}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={submitExam.isPending || (timeLimited && secondsLeft === 0)}
          onClick={() => void handleSubmit()}
        >
          {submitExam.isPending ? 'Đang nộp...' : 'Nộp bài'}
        </Button>
      </div>
    </section>
  )
}
