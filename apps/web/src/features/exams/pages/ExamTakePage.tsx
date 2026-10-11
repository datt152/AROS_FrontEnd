import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Maximize2 } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { ExamTimeWarningDialog } from '../../../components/common/ExamTimeWarningDialog'
import { useExamTimeWarning } from '../../../hooks/useExamTimeWarning'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { ROUTES } from '../../../routes/routes.config'
import { useAuthSession } from '../../auth/hooks/useAuthSession'
import { ExamTakePreview } from '../components/ExamTakePreview'
import { ExamTakeQuestionNav } from '../components/ExamTakeQuestionNav'
import { ExamTakeQuestionPanel } from '../components/ExamTakeQuestionPanel'
import { ExamTakeSubmitDialog } from '../components/ExamTakeSubmitDialog'
import { useFullscreen } from '../hooks/useFullscreen'
import { useSubmitExam, useTakeExam } from '../hooks/useExams'
import {
  clearExamTakeDraft,
  loadActiveExamTake,
  loadExamTakeDraft,
  saveExamTakeDraft,
} from '../lib/examTakeDraft'
import type { TakeExamLocationState } from '../types/studentExam.types'
import {
  answersToSubmitPayload,
  mapExamTakeError,
  type ExamTakeItem,
  type SubmissionResultItem,
} from '../types/exam.types'

type Phase = 'answering' | 'preview'

function readTakeState(state: unknown): TakeExamLocationState | undefined {
  if (!state || typeof state !== 'object') return undefined
  const examId = (state as TakeExamLocationState).examId
  const classroomId = (state as TakeExamLocationState).classroomId
  if (typeof examId !== 'number' || !Number.isFinite(examId) || examId <= 0) return undefined
  if (typeof classroomId !== 'number' || !Number.isFinite(classroomId) || classroomId <= 0) {
    return undefined
  }
  return { examId, classroomId }
}

function hasAnswer(value: string | string[] | undefined) {
  if (value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  return value.length > 0
}

export function ExamTakePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session } = useAuthSession()
  const userEmail = session?.email

  const locationTake = readTakeState(location.state)
  const activeTake = useMemo(
    () => (locationTake ? null : loadActiveExamTake(userEmail, 'exam')),
    [locationTake, userEmail],
  )
  const examId = locationTake?.examId ?? activeTake?.examId
  const classroomId = locationTake?.classroomId ?? activeTake?.classroomId

  const shellRef = useRef<HTMLElement | null>(null)
  const fullscreen = useFullscreen(shellRef)
  const draftRestoredRef = useRef(false)
  const [draftReady, setDraftReady] = useState(false)

  const [result, setResult] = useState<SubmissionResultItem | null>(null)
  const [submittedExam, setSubmittedExam] = useState<ExamTakeItem | null>(null)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const autoSubmittedRef = useRef(false)

  const takeQuery = useTakeExam(examId, classroomId, !result)
  const submitExam = useSubmitExam()
  const exam = submittedExam ?? takeQuery.data

  useEffect(() => {
    if (!exam || !classroomId || draftRestoredRef.current) return
    draftRestoredRef.current = true
    const draft = userEmail ? loadExamTakeDraft(userEmail, exam.examId, classroomId, 'exam') : null
    if (draft) {
      if (draft.versionCode && draft.versionCode !== exam.versionCode) {
        clearExamTakeDraft(userEmail, exam.examId, classroomId, 'exam')
      } else {
        setAnswers(draft.answers ?? {})
        setFlagged(new Set(draft.flagged ?? []))
        setCurrentIndex(
          Math.min(Math.max(draft.currentIndex ?? 0, 0), Math.max(exam.questions.length - 1, 0)),
        )
        setPhase(draft.phase === 'preview' ? 'preview' : 'answering')
      }
    }
    setDraftReady(true)
  }, [exam, userEmail, classroomId])

  useEffect(() => {
    if (!draftReady || !exam || !userEmail || !classroomId || result) return
    saveExamTakeDraft(
      userEmail,
      {
        examId: exam.examId,
        classroomId,
        versionCode: exam.versionCode,
        answers,
        flagged: Array.from(flagged),
        currentIndex,
        phase,
        updatedAt: Date.now(),
      },
      'exam',
    )
  }, [draftReady, exam, userEmail, classroomId, answers, flagged, currentIndex, phase, result])

  const deadline = useMemo(() => {
    if (!exam) return 0
    return new Date(exam.startTime).getTime() + exam.duration * 60 * 1000
  }, [exam])

  useEffect(() => {
    if (result || !exam || exam.timeLimitEnabled === false) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [result, exam])

  useEffect(() => {
    if (result) void fullscreen.exit()
  }, [result, fullscreen])

  const secondsLeft = exam ? Math.max(0, Math.floor((deadline - now) / 1000)) : 0
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeLimitedActive = Boolean(exam && exam.timeLimitEnabled !== false && !result)
  const timeWarning = useExamTimeWarning(timeLimitedActive ? secondsLeft : null, timeLimitedActive)

  const questionIds = useMemo(() => exam?.questions.map((q) => q.questionId) ?? [], [exam])
  const unansweredCount = useMemo(() => {
    if (!exam) return 0
    return exam.questions.filter((q) => !hasAnswer(answers[q.questionId])).length
  }, [exam, answers])

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

  function clearAnswer(questionId: number) {
    setAnswers((current) => {
      const next = { ...current }
      delete next[questionId]
      return next
    })
  }

  function toggleFlag(questionId: number) {
    setFlagged((current) => {
      const next = new Set(current)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  async function handleSubmit(options?: { timedOut?: boolean }) {
    if (!exam || !classroomId || submitExam.isPending) return
    setSubmitError(null)
    try {
      const data = await submitExam.mutateAsync({
        examId: exam.examId,
        classroomId,
        versionCode: exam.versionCode,
        answers: answersToSubmitPayload(answers),
      })
      clearExamTakeDraft(userEmail, exam.examId, classroomId, 'exam')
      setSubmittedExam(exam)
      setResult(data)
      setSubmitDialogOpen(false)
      void navigate(ROUTES.student.takeExam, { replace: true, state: null })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể nộp bài')
      setSubmitError(mapExamTakeError(message))
      if (options?.timedOut) autoSubmittedRef.current = false
    }
  }

  useEffect(() => {
    if (!exam || exam.timeLimitEnabled === false || result || secondsLeft > 0 || submitExam.isPending) {
      return
    }
    if (autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    void handleSubmit({ timedOut: true })
  }, [exam, result, secondsLeft, submitExam.isPending])

  if (result && exam) {
    const scoreVisible = result.scoreVisible !== false && exam.showScoreToStudent !== false
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
                {result.totalScore?.toFixed(2)}/{result.maxScore?.toFixed(2)}
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

  if (examId === undefined || classroomId === undefined) {
    return (
      <section className="mx-auto max-w-lg py-10">
        <EmptyState
          title="Chưa chọn bài thi"
          description="Vào làm bài từ danh sách bài thi theo lớp. Không mở trang này trực tiếp bằng URL."
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
  const currentQuestion = exam.questions[currentIndex]

  return (
    <section ref={shellRef} className="fixed inset-0 z-[70] flex flex-col bg-white text-slate-900">
      <ExamTimeWarningDialog
        open={timeWarning.open}
        secondsLeft={timeWarning.secondsLeft}
        onDismiss={timeWarning.dismiss}
      />

      {!fullscreen.isFullscreen ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-white">
          <Maximize2 className="h-10 w-10 text-blue-300" strokeWidth={1.5} />
          <div className="max-w-md space-y-2">
            <h1 className="text-xl font-semibold">Bắt buộc toàn màn hình</h1>
            <p className="text-sm text-slate-300">
              Để làm bài <span className="font-medium text-white">{exam.title}</span>, bạn cần bật chế độ
              toàn màn hình. Nếu thoát giữa chừng, hệ thống sẽ yêu cầu bật lại.
            </p>
            {fullscreen.error ? <p className="text-sm text-red-300">{fullscreen.error}</p> : null}
          </div>
          <Button type="button" className="h-11 min-w-48 px-6" onClick={() => void fullscreen.enter()}>
            Vào toàn màn hình để làm bài
          </Button>
        </div>
      ) : (
        <>
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Làm bài</p>
              <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{exam.title}</h1>
              <p className="text-xs text-slate-500">Mã đề {exam.versionCode}</p>
            </div>
            {timeLimited ? (
              <div
                className={`rounded-xl border px-4 py-2 text-center ${
                  secondsLeft <= 30
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <p
                  className={`text-[11px] uppercase tracking-wider ${
                    secondsLeft <= 30 ? 'text-red-500' : 'text-slate-500'
                  }`}
                >
                  Thời gian còn
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>
            ) : (
              <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                Không giới hạn giờ
              </span>
            )}
          </header>

          {submitError ? (
            <p className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 sm:px-6">
              {submitError}
            </p>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="max-h-40 shrink-0 overflow-hidden border-b border-slate-200 lg:max-h-none lg:h-full lg:border-b-0">
              <ExamTakeQuestionNav
                total={exam.questions.length}
                currentIndex={currentIndex}
                answers={answers}
                flagged={flagged}
                questionIds={questionIds}
                onSelect={(index) => {
                  setCurrentIndex(index)
                  setPhase('answering')
                }}
              />
            </div>

            {phase === 'answering' && currentQuestion ? (
              <ExamTakeQuestionPanel
                index={currentIndex}
                total={exam.questions.length}
                question={currentQuestion}
                answer={answers[currentQuestion.questionId]}
                flagged={flagged.has(currentQuestion.questionId)}
                onSingleAnswer={(label) => setSingleAnswer(currentQuestion.questionId, label)}
                onToggleMulti={(label) => toggleMultiAnswer(currentQuestion.questionId, label)}
                onClear={() => clearAnswer(currentQuestion.questionId)}
                onToggleFlag={() => toggleFlag(currentQuestion.questionId)}
                onPrev={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                onNext={() =>
                  setCurrentIndex((value) => Math.min(exam.questions.length - 1, value + 1))
                }
                onFinish={() => setPhase('preview')}
              />
            ) : (
              <ExamTakePreview
                questions={exam.questions}
                answers={answers}
                flagged={flagged}
                onEdit={(index) => {
                  setCurrentIndex(index)
                  setPhase('answering')
                }}
                onSubmitClick={() => setSubmitDialogOpen(true)}
                canSubmit={canSubmit}
                isSubmitting={submitExam.isPending}
                submitLabel={timeLimited && secondsLeft === 0 ? 'Hết giờ' : 'Nộp bài'}
              />
            )}
          </div>

          <ExamTakeSubmitDialog
            open={submitDialogOpen}
            unansweredCount={unansweredCount}
            isSubmitting={submitExam.isPending}
            onClose={() => setSubmitDialogOpen(false)}
            onConfirm={() => void handleSubmit()}
          />
        </>
      )}
    </section>
  )
}
