import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { ExamTimeWarningDialog, useExamTimeWarning } from '../../../components/common/ExamTimeWarningDialog'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { useSubmitExam, useTakeExam } from '../../exams/hooks/useExams'
import {
  answersToSubmitPayload,
  mapExamTakeError,
  type ExamTakeItem,
  type SubmissionResultItem,
} from '../../exams/types/exam.types'
import type { TakeExamLocationState } from '../../exams/types/studentExam.types'
import { ROUTES } from '../../../routes/routes.config'
import { PracticeAttemptBadge } from '../components/PracticeAttemptBadge'
import { canRetryPractice } from '../types/practice.types'

function readExamIdFromState(state: unknown): number | undefined {
  if (!state || typeof state !== 'object') return undefined
  const examId = (state as TakeExamLocationState).examId
  return typeof examId === 'number' && Number.isFinite(examId) && examId > 0 ? examId : undefined
}

export function PracticeTakePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const examId = readExamIdFromState(location.state)

  const [result, setResult] = useState<SubmissionResultItem | null>(null)
  const [submittedExam, setSubmittedExam] = useState<ExamTakeItem | null>(null)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [takeKey, setTakeKey] = useState(0)
  const autoSubmittedRef = useRef(false)

  const takeQuery = useTakeExam(examId, !result)
  const submitExam = useSubmitExam()

  const exam = submittedExam ?? takeQuery.data
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
  const timeLimitedActive = Boolean(timeLimited && exam && !result)
  const timeWarning = useExamTimeWarning(timeLimitedActive ? secondsLeft : null, timeLimitedActive)

  async function handleSubmit(options?: { timedOut?: boolean }) {
    if (!exam || submitExam.isPending) return
    setSubmitError(null)
    try {
      const data = await submitExam.mutateAsync({
        examId: exam.examId,
        versionCode: exam.versionCode,
        answers: answersToSubmitPayload(answers),
      })
      setSubmittedExam(exam)
      setResult(data)
      void navigate(ROUTES.student.takePractice, { replace: true, state: null })
    } catch (error) {
      setSubmitError(mapExamTakeError(getApiErrorMessage(error, 'Không thể nộp bài')))
      if (options?.timedOut) autoSubmittedRef.current = false
    }
  }

  useEffect(() => {
    if (!timeLimited || !exam || result || secondsLeft === null || secondsLeft > 0 || submitExam.isPending) return
    if (autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    void handleSubmit({ timedOut: true })
  }, [timeLimited, exam, result, secondsLeft, submitExam.isPending])

  async function handleRetry() {
    if (!examId && !submittedExam) return
    const retryId = examId ?? submittedExam?.examId
    setResult(null)
    setSubmittedExam(null)
    setAnswers({})
    setSubmitError(null)
    autoSubmittedRef.current = false
    timeWarning.resetWarning()
    setTakeKey((value) => value + 1)
    if (retryId) {
      void navigate(ROUTES.student.takePractice, {
        replace: true,
        state: { examId: retryId } satisfies TakeExamLocationState,
      })
    }
    await takeQuery.refetch()
  }

  if (result && exam) {
    const scoreVisible = result.scoreVisible !== false && exam.showScoreToStudent !== false
    const canRetry = canRetryPractice(result.attemptNo ?? attemptNo, maxAttempts)
    return (
      <section className="mx-auto max-w-lg space-y-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Kết quả luyện tập</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">Nộp bài thành công</h1>
          <p className="mt-1 text-sm text-slate-500">{exam.title}</p>
          <div className="mt-3 flex justify-center">
            <PracticeAttemptBadge attemptNo={result.attemptNo ?? attemptNo} maxAttempts={maxAttempts} />
          </div>

          {scoreVisible ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5">
              <p className="text-sm text-slate-600">Đây là điểm số của bạn</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                {result.totalScore?.toFixed(2)}/{result.maxScore?.toFixed(2)}
              </p>
              {result.correctQuestions != null && result.totalQuestions != null ? (
                <p className="mt-2 text-sm text-slate-500">
                  Đúng {result.correctQuestions}/{result.totalQuestions} câu
                </p>
              ) : null}
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
            <Link to={ROUTES.student.practice}>
              <Button variant="secondary" className="w-full sm:w-auto">
                Về danh sách luyện tập
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (examId === undefined) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState
          title="Chưa chọn bài luyện tập"
          description="Vào làm từ danh sách luyện tập. Không mở trang này trực tiếp bằng URL."
          action={
            <Link to={ROUTES.student.practice}>
              <Button variant="secondary">Về danh sách luyện tập</Button>
            </Link>
          }
        />
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
      <section className="mx-auto max-w-lg space-y-4 py-10">
        <EmptyState
          title={exhausted ? 'Đã hết lượt làm bài' : 'Không thể vào làm bài'}
          description={message}
        />
        <Link to={ROUTES.student.practice} className="block">
          <Button variant="secondary" className="w-full">
            Quay lại danh sách
          </Button>
        </Link>
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

  return (
    <section className="mx-auto max-w-3xl space-y-5 py-6">
      <ExamTimeWarningDialog
        open={timeWarning.open}
        secondsLeft={timeWarning.secondsLeft}
        onDismiss={timeWarning.dismiss}
      />
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Luyện tập</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{exam.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PracticeAttemptBadge attemptNo={attemptNo} maxAttempts={maxAttempts} />
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
