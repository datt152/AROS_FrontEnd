import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ROUTES } from '../../../routes/routes.config'
import { PracticeAttemptBadge } from '../components/PracticeAttemptBadge'
import type { PracticeSubmissionResult, PracticeTakeItem } from '../types/practice.types'
import { MOCK_PRACTICE_TAKE, canRetryPractice } from '../types/practice.types'

/** Skeleton UI — SV làm luyện tập (mock). Note: chưa có API “đề của tôi”. */
export function PracticeTakePage() {
  const { practiceId } = useParams<{ practiceId: string }>()
  const examId = Number(practiceId)

  const [take, setTake] = useState<PracticeTakeItem | null>(null)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [result, setResult] = useState<PracticeSubmissionResult | null>(null)
  const [now, setNow] = useState(Date.now())
  const [noAttemptsLeft, setNoAttemptsLeft] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(examId) || examId <= 0) {
      setTake(null)
      return
    }
    // Mock: id 503 = ẩn điểm; id khác dùng take mặc định; hết lượt demo bằng ? hoặc id 999
    if (examId === 999) {
      setNoAttemptsLeft(true)
      setTake(null)
      return
    }

    const base: PracticeTakeItem = {
      ...MOCK_PRACTICE_TAKE,
      examId,
      showScoreToStudent: examId !== 503,
      timeLimitEnabled: examId === 503 || examId === 502,
      maxAttempts: examId === 503 ? 1 : 3,
      attemptNo: 1,
      title: examId === 503 ? 'Ôn SQL cơ bản' : MOCK_PRACTICE_TAKE.title,
    }
    setTake(base)
    setResult(null)
    setAnswers({})
    setNoAttemptsLeft(false)
  }, [examId])

  const deadline = useMemo(() => {
    if (!take || !take.timeLimitEnabled) return 0
    return new Date(take.startTime).getTime() + take.duration * 60 * 1000
  }, [take])

  useEffect(() => {
    if (!take?.timeLimitEnabled || result) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [take, result])

  const secondsLeft =
    take?.timeLimitEnabled && deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : null

  function handleSubmit() {
    if (!take) return
    const scoreVisible = take.showScoreToStudent
    setResult({
      submissionId: Date.now(),
      attemptNo: take.attemptNo,
      scoreVisible,
      totalScore: scoreVisible ? 7 : undefined,
      maxScore: scoreVisible ? 10 : undefined,
      correctQuestions: scoreVisible ? 1 : undefined,
      totalQuestions: scoreVisible ? take.questions.length : undefined,
    })
  }

  function handleRetry() {
    if (!take) return
    if (!canRetryPractice(take.attemptNo, take.maxAttempts)) {
      setNoAttemptsLeft(true)
      return
    }
    setTake({
      ...take,
      attemptNo: take.attemptNo + 1,
      startTime: new Date().toISOString(),
    })
    setAnswers({})
    setResult(null)
  }

  if (!Number.isFinite(examId) || examId <= 0) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState title="Không tìm thấy bài luyện tập" description="Đường dẫn không hợp lệ." />
      </section>
    )
  }

  if (noAttemptsLeft) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState
          title="Đã hết lượt làm bài"
          description="Bạn đã dùng hết số lần luyện tập được phép. Liên hệ giáo viên nếu cần mở thêm."
          action={
            <Link
              to={ROUTES.student.practice}
              className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white"
            >
              Quay lại danh sách
            </Link>
          }
        />
      </section>
    )
  }

  if (!take) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState title="Không tải được bài" description="Thử đường dẫn /student/practice/take/501 (mock)." />
      </section>
    )
  }

  if (result) {
    const canRetry = canRetryPractice(result.attemptNo, take.maxAttempts)
    return (
      <section className="mx-auto max-w-lg space-y-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Kết quả luyện tập</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            {result.scoreVisible ? 'Đã nộp bài' : 'Nộp thành công'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{take.title}</p>
          <div className="mt-3 flex justify-center">
            <PracticeAttemptBadge attemptNo={result.attemptNo} maxAttempts={take.maxAttempts} />
          </div>

          {result.scoreVisible ? (
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
              <Button onClick={handleRetry}>Làm lại</Button>
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
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{take.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PracticeAttemptBadge attemptNo={take.attemptNo} maxAttempts={take.maxAttempts} />
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              Mã đề {take.versionCode}
            </span>
            {!take.timeLimitEnabled ? (
              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                Không giới hạn giờ
              </span>
            ) : null}
          </div>
        </div>
        {take.timeLimitEnabled && secondsLeft !== null ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700">Còn lại</p>
            <p className="text-lg font-semibold tabular-nums text-amber-900">
              {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
              {String(secondsLeft % 60).padStart(2, '0')}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {take.questions.map((question, index) => (
          <div key={question.questionId} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">
              Câu {index + 1}. {question.content}
            </p>
            <div className="mt-3 space-y-2">
              {question.options.map((option) => {
                const selected = answers[question.questionId]
                const isChecked =
                  question.type === 'MULTIPLE_CHOICE'
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
                      type={question.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                      name={`q-${question.questionId}`}
                      checked={isChecked}
                      onChange={() => {
                        if (question.type === 'MULTIPLE_CHOICE') {
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
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSubmit}>Nộp bài</Button>
      </div>
    </section>
  )
}
