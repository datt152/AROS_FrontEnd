import { Ionicons } from '@expo/vector-icons'
import type { SubmissionResultItem } from '@aros/shared/features/exams/types/exam.types'
import { canRetryPractice } from '@aros/shared/features/practice/types/practice.types'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type ExamResultCardProps = {
  result: SubmissionResultItem
  examTitle: string
  purpose: 'EXAM' | 'PRACTICE'
  attemptNo: number
  maxAttempts: number | null
  showScoreToStudent: boolean
  onRetry?: () => void
  onBack: () => void
  isRetrying?: boolean
}

export function ExamResultCard({
  result,
  examTitle,
  purpose,
  attemptNo,
  maxAttempts,
  showScoreToStudent,
  onRetry,
  onBack,
  isRetrying,
}: ExamResultCardProps) {
  const scoreVisible = result.scoreVisible !== false && showScoreToStudent !== false
  const canRetry = purpose === 'PRACTICE' && canRetryPractice(result.attemptNo ?? attemptNo, maxAttempts)

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
        </View>

        <Text style={styles.purposeTag}>
          {purpose === 'PRACTICE' ? 'Kết quả luyện tập' : 'Kết quả bài thi'}
        </Text>
        <Text style={styles.title}>Nộp bài thành công</Text>
        <Text style={styles.examTitle}>{examTitle}</Text>

        {/* Attempt info — chỉ hiện cho PRACTICE */}
        {purpose === 'PRACTICE' ? (
          <View style={styles.attemptBadge}>
            <Ionicons name="repeat-outline" size={14} color={colors.primary} />
            <Text style={styles.attemptText}>
              Lượt {result.attemptNo ?? attemptNo}
              {maxAttempts != null ? ` / ${maxAttempts}` : ''}
            </Text>
          </View>
        ) : null}

        {/* Score */}
        {scoreVisible ? (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Điểm của bạn</Text>
            <Text style={styles.scoreValue}>
              {result.totalScore?.toFixed(2)}/{result.maxScore?.toFixed(2)}
            </Text>
            {result.correctQuestions != null && result.totalQuestions != null ? (
              <Text style={styles.scoreDetail}>
                Đúng {result.correctQuestions}/{result.totalQuestions} câu
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.noScoreBox}>
            <Ionicons name="eye-off-outline" size={20} color={colors.textSubtle} />
            <Text style={styles.noScoreText}>
              {purpose === 'EXAM'
                ? 'Bài làm của bạn đã được ghi nhận.'
                : 'Giáo viên đã tắt hiện điểm.'}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {purpose === 'PRACTICE' && canRetry ? (
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
              onPress={onRetry}
              disabled={isRetrying}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>
                {isRetrying ? 'Đang tải…' : 'Làm lại'}
              </Text>
            </Pressable>
          ) : purpose === 'PRACTICE' ? (
            <Text style={styles.noRetryText}>Bạn đã hết lượt làm lại.</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.btnSecondaryPressed]}
            onPress={onBack}
          >
            <Text style={styles.btnSecondaryText}>
              {purpose === 'PRACTICE' ? 'Về danh sách luyện tập' : 'Về danh sách bài thi'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    marginBottom: 4,
  },
  purposeTag: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  examTitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  attemptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },
  attemptText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  scoreBox: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  scoreLabel: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  scoreDetail: {
    fontSize: 13,
    color: '#065F46',
  },
  noScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    width: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  noScoreText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnPrimaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  btnSecondaryPressed: {
    backgroundColor: '#E2E8F0',
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  noRetryText: {
    fontSize: 14,
    color: colors.textSubtle,
    textAlign: 'center',
  },
})
