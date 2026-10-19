import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import {
  STUDENT_EXAM_STATUS_LABEL,
  STUDENT_MY_STATUS_LABEL,
  canShowStudentScoreOnCard,
  formatStudentExamSchedule,
  formatStudentScore,
  getStudentTakeBlockReason,
  type StudentExamListItem,
  type StudentExamStatus,
  type StudentMyStatus,
} from '@aros/shared/features/exams/types/studentExam.types'

import { colors } from '@/theme/colors'

const STATUS_ACCENT: Record<StudentExamStatus, string> = {
  UPCOMING: '#0EA5E9',
  ONGOING: '#10B981',
  COMPLETED: '#8B5CF6',
  CLOSED: '#EF4444',
}

const MY_STATUS_STYLE: Record<StudentMyStatus, { bg: string; text: string; icon: string }> = {
  NOT_STARTED: { bg: '#F1F5F9', text: '#64748B', icon: 'ellipse-outline' },
  IN_PROGRESS: { bg: '#FEF3C7', text: '#92400E', icon: 'play-circle-outline' },
  EXPIRED: { bg: '#FEE2E2', text: '#991B1B', icon: 'alert-circle-outline' },
  SUBMITTED: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-done-outline' },
}

type PracticeCardProps = {
  exam: StudentExamListItem
}

export function PracticeCard({ exam }: PracticeCardProps) {
  const showScore = canShowStudentScoreOnCard(exam)
  const blockReason = getStudentTakeBlockReason(exam, 'PRACTICE')
  const accent = STATUS_ACCENT[exam.examStatus]
  const myStyle = MY_STATUS_STYLE[exam.myStatus]

  const statusHint = exam.canTake
    ? exam.myStatus === 'IN_PROGRESS'
      ? 'Tiếp tục làm bài'
      : exam.myStatus === 'SUBMITTED' || exam.myStatus === 'EXPIRED'
        ? 'Còn lượt làm lại'
        : 'Sẵn sàng luyện tập'
    : blockReason

  return (
    <View style={styles.card}>
      {/* Thanh accent trái */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.body}>
        {/* Header: title + exam status */}
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>
            <View style={styles.scheduleRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSubtle} />
              <Text style={styles.schedule}>
                {formatStudentExamSchedule(exam.startAt, exam.endAt)}
              </Text>
            </View>
          </View>
          <View style={[styles.examBadge, { backgroundColor: accent + '18' }]}>
            <View style={[styles.examDot, { backgroundColor: accent }]} />
            <Text style={[styles.examBadgeText, { color: accent }]}>
              {STUDENT_EXAM_STATUS_LABEL[exam.examStatus]}
            </Text>
          </View>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <MetaPill icon="time-outline" text={exam.timeLimitEnabled ? `${exam.duration} phút` : 'Tự do'} />
          {exam.totalQuestions > 0 ? (
            <MetaPill icon="list-outline" text={`${exam.totalQuestions} câu`} />
          ) : null}
          <MetaPill icon="trophy-outline" text={`${exam.maxScore} điểm`} />
        </View>

        {/* Điểm */}
        {showScore ? (
          <View style={styles.scoreStrip}>
            <View style={styles.scoreLeft}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={styles.scoreValue}>
                {formatStudentScore(exam.myScore!, exam.maxScore)}
              </Text>
            </View>
            <Text style={styles.scoreLabel}>Điểm của bạn</Text>
          </View>
        ) : null}

        {/* Footer: my status + hint */}
        <View style={styles.footer}>
          <View style={[styles.myBadge, { backgroundColor: myStyle.bg }]}>
            <Ionicons name={myStyle.icon as any} size={14} color={myStyle.text} />
            <Text style={[styles.myBadgeText, { color: myStyle.text }]}>
              {STUDENT_MY_STATUS_LABEL[exam.myStatus]}
            </Text>
          </View>
          {statusHint ? (
            <Text style={[styles.hint, exam.canTake && styles.hintActive]} numberOfLines={1}>
              {statusHint}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  )
}

function MetaPill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon as any} size={13} color={colors.textMuted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  schedule: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  examDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  scoreStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  myBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  myBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    flex: 1,
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: 'right',
  },
  hintActive: {
    color: colors.accent,
    fontWeight: '600',
  },
})
