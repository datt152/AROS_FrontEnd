import { Ionicons } from '@expo/vector-icons'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import {
  answersToSubmitPayload,
  mapExamTakeError,
  type ExamTakeItem,
  type SubmissionResultItem,
} from '@aros/shared/features/exams/types/exam.types'
import {
  clearExamTakeDraft,
  loadExamTakeDraft,
  saveExamTakeDraft,
  type TakeDraftScope,
} from '@aros/shared/features/exams/lib/examTakeDraft'
import { takeExam, submitExam as submitExamApi } from '@aros/shared/features/exams/api/exams.api'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '@/features/auth/store/authContext'
import { colors } from '@/theme/colors'

import { ExamResultCard } from '../components/ExamResultCard'
import { ExamTakeHeader } from '../components/ExamTakeHeader'
import { QuestionNavModal } from '../components/QuestionNavModal'
import { QuestionView } from '../components/QuestionView'
import { SubmitConfirmModal } from '../components/SubmitConfirmModal'
import { SubmitPreview } from '../components/SubmitPreview'

type Phase = 'answering' | 'preview'

type ExamTakeScreenProps = {
  examId: number
  classroomId: number
  purpose: 'EXAM' | 'PRACTICE'
}

function hasAnswer(value: string | string[] | undefined) {
  if (!value) return false
  return Array.isArray(value) ? value.length > 0 : value.length > 0
}

export function ExamTakeScreen({ examId, classroomId, purpose }: ExamTakeScreenProps) {
  const router = useRouter()
  const { state: authState } = useAuth()
  const userEmail = authState.status === 'signedIn' ? authState.session.email : undefined
  const scope: TakeDraftScope = purpose === 'PRACTICE' ? 'practice' : 'exam'

  // ─── Loading / error ────────────────────────────────────
  const [exam, setExam] = useState<ExamTakeItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [takeKey, setTakeKey] = useState(0)

  // ─── Exam state ─────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [draftReady, setDraftReady] = useState(false)
  const draftRestoredRef = useRef(false)

  // ─── Submission ─────────────────────────────────────────
  const [result, setResult] = useState<SubmissionResultItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [navModalVisible, setNavModalVisible] = useState(false)
  const [submitModalVisible, setSubmitModalVisible] = useState(false)
  const autoSubmittedRef = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  // ─── Timer ──────────────────────────────────────────────
  const [now, setNow] = useState(() => Date.now())
  const timeLimited = Boolean(exam?.timeLimitEnabled)
  const deadline = useMemo(() => {
    if (!exam || !timeLimited) return 0
    return new Date(exam.startTime).getTime() + exam.duration * 60 * 1000
  }, [exam, timeLimited])
  const secondsLeft =
    timeLimited && deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : null

  // ─── Fetch exam ─────────────────────────────────────────
  useEffect(() => {
    if (!examId || !classroomId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    takeExam(examId, classroomId)
      .then((data) => {
        if (cancelled) return
        setExam(data)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(mapExamTakeError(getApiErrorMessage(err, 'Không thể vào làm bài')))
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [examId, classroomId, takeKey])

  // ─── Restore draft ──────────────────────────────────────
  useEffect(() => {
    if (!exam || draftRestoredRef.current) return
    draftRestoredRef.current = true

    const attemptExpired =
      timeLimited &&
      Date.now() >= new Date(exam.startTime).getTime() + exam.duration * 60 * 1000

    if (attemptExpired && purpose === 'PRACTICE') {
      clearExamTakeDraft(userEmail, exam.examId, classroomId, scope)
      setDraftReady(true)
      return
    }

    const draft = userEmail
      ? loadExamTakeDraft(userEmail, exam.examId, classroomId, scope)
      : null

    if (draft) {
      if (draft.versionCode && draft.versionCode !== exam.versionCode) {
        clearExamTakeDraft(userEmail, exam.examId, classroomId, scope)
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
  }, [exam, userEmail, classroomId, scope, timeLimited, purpose, takeKey])

  // ─── Auto-save draft ───────────────────────────────────
  const saveDraft = useCallback(() => {
    if (!exam || !userEmail || result) return
    saveExamTakeDraft(
      userEmail,
      {
        examId: exam.examId,
        classroomId,
        versionCode: exam.versionCode,
        answers: answersRef.current,
        flagged: Array.from(flagged),
        currentIndex,
        phase,
        updatedAt: Date.now(),
      },
      scope,
    )
  }, [exam, userEmail, classroomId, flagged, currentIndex, phase, result, scope])

  useEffect(() => {
    if (!draftReady || !exam || !userEmail || result) return
    saveDraft()
  }, [draftReady, saveDraft, answers, result])

  // ─── AppState listener (save on background) ─────────────
  useEffect(() => {
    if (!draftReady || !exam || result) return
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        saveDraft()
      }
    })
    return () => sub.remove()
  }, [draftReady, exam, result, saveDraft])

  // ─── Timer tick ─────────────────────────────────────────
  useEffect(() => {
    if (result || !exam || !timeLimited) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [result, exam, timeLimited])

  // ─── Auto-submit on timeout ─────────────────────────────
  useEffect(() => {
    if (!timeLimited || !exam || result || secondsLeft === null || secondsLeft > 0 || submitting) {
      return
    }
    if (autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    void handleSubmit()
  }, [timeLimited, exam, result, secondsLeft, submitting])

  // ─── Derived ────────────────────────────────────────────
  const questionIds = useMemo(() => exam?.questions.map((q) => q.questionId) ?? [], [exam])
  const answeredCount = useMemo(
    () => questionIds.filter((qid) => hasAnswer(answers[qid])).length,
    [questionIds, answers],
  )
  const unansweredCount = exam ? exam.questions.length - answeredCount : 0

  // ─── Answer handlers ───────────────────────────────────
  function setSingleAnswer(questionId: number, label: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: label }))
  }

  function toggleMultiAnswer(questionId: number, label: string) {
    setAnswers((prev) => {
      const existing = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : []
      const next = existing.includes(label)
        ? existing.filter((item) => item !== label)
        : [...existing, label]
      return { ...prev, [questionId]: next }
    })
  }

  function clearAnswer(questionId: number) {
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  function toggleFlag(questionId: number) {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  // ─── Submit ─────────────────────────────────────────────
  async function handleSubmit() {
    if (!exam || submitting) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const data = await submitExamApi({
        examId: exam.examId,
        classroomId,
        versionCode: exam.versionCode,
        answers: answersToSubmitPayload(answersRef.current),
      })
      clearExamTakeDraft(userEmail, exam.examId, classroomId, scope)
      setResult(data)
      setSubmitModalVisible(false)
    } catch (err) {
      setSubmitError(mapExamTakeError(getApiErrorMessage(err, 'Không thể nộp bài')))
      autoSubmittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Retry (practice only) ─────────────────────────────
  function handleRetry() {
    if (!exam) return
    clearExamTakeDraft(userEmail, exam.examId, classroomId, scope)
    setResult(null)
    setAnswers({})
    setFlagged(new Set())
    setCurrentIndex(0)
    setPhase('answering')
    setSubmitError(null)
    draftRestoredRef.current = false
    setDraftReady(false)
    autoSubmittedRef.current = false
    setTakeKey((v) => v + 1)
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(purpose === 'PRACTICE' ? '/student/(tabs)/practice' : '/student/(tabs)/exams')
    }
  }

  // ─── Render: Result ─────────────────────────────────────
  if (result && exam) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ExamResultCard
          result={result}
          examTitle={exam.title}
          purpose={purpose}
          attemptNo={exam.attemptNo ?? 1}
          maxAttempts={exam.maxAttempts ?? null}
          showScoreToStudent={exam.showScoreToStudent !== false}
          onRetry={purpose === 'PRACTICE' ? handleRetry : undefined}
          onBack={goBack}
          isRetrying={loading}
        />
      </SafeAreaView>
    )
  }

  // ─── Render: Loading ────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Đang tải {purpose === 'PRACTICE' ? 'bài luyện tập' : 'bài thi'}…
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // ─── Render: Error ──────────────────────────────────────
  if (error || !exam) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.danger} />
          </View>
          <Text style={styles.errorTitle}>Không thể vào làm bài</Text>
          <Text style={styles.errorText}>{error ?? 'Không tải được dữ liệu bài thi.'}</Text>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={goBack}
          >
            <Text style={styles.backBtnText}>Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // ─── Render: Main ───────────────────────────────────────
  const currentQuestion = exam.questions[currentIndex]
  const canSubmit = !submitting && (!timeLimited || (secondsLeft !== null && secondsLeft > 0))

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExamTakeHeader
        title={exam.title}
        versionCode={exam.versionCode}
        purpose={purpose}
        currentIndex={currentIndex}
        total={exam.questions.length}
        secondsLeft={secondsLeft}
        onMenuPress={() => setNavModalVisible(true)}
      />

      {submitError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.errorBannerText}>{submitError}</Text>
        </View>
      ) : null}

      {phase === 'answering' && currentQuestion ? (
        <QuestionView
          index={currentIndex}
          total={exam.questions.length}
          content={currentQuestion.content}
          type={currentQuestion.type}
          options={currentQuestion.options}
          answer={answers[currentQuestion.questionId]}
          flagged={flagged.has(currentQuestion.questionId)}
          onSelectSingle={(label) => setSingleAnswer(currentQuestion.questionId, label)}
          onToggleMulti={(label) => toggleMultiAnswer(currentQuestion.questionId, label)}
          onClearAnswer={() => clearAnswer(currentQuestion.questionId)}
          onToggleFlag={() => toggleFlag(currentQuestion.questionId)}
          onPrev={() => setCurrentIndex((v) => Math.max(0, v - 1))}
          onNext={() => setCurrentIndex((v) => Math.min(exam.questions.length - 1, v + 1))}
          onFinish={() => setPhase('preview')}
        />
      ) : (
        <SubmitPreview
          questions={exam.questions}
          answers={answers}
          flagged={flagged}
          canSubmit={canSubmit}
          isSubmitting={submitting}
          onEdit={(index) => {
            setCurrentIndex(index)
            setPhase('answering')
          }}
          onSubmitPress={() => setSubmitModalVisible(true)}
        />
      )}

      <QuestionNavModal
        visible={navModalVisible}
        total={exam.questions.length}
        currentIndex={currentIndex}
        answers={answers}
        flagged={flagged}
        questionIds={questionIds}
        answeredCount={answeredCount}
        onSelect={(index) => {
          setCurrentIndex(index)
          setPhase('answering')
          setNavModalVisible(false)
        }}
        onClose={() => setNavModalVisible(false)}
        onFinish={() => {
          setPhase('preview')
          setNavModalVisible(false)
        }}
      />

      <SubmitConfirmModal
        visible={submitModalVisible}
        unansweredCount={unansweredCount}
        isSubmitting={submitting}
        onClose={() => setSubmitModalVisible(false)}
        onConfirm={() => void handleSubmit()}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  errorText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginTop: 4,
  },
  backBtnPressed: {
    backgroundColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FECACA',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
  },
})
