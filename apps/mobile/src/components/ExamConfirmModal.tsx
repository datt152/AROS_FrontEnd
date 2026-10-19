import { Ionicons } from '@expo/vector-icons'
import {
  STUDENT_EXAM_STATUS_LABEL,
  formatStudentExamSchedule,
  type StudentExamListItem,
} from '@aros/shared/features/exams/types/studentExam.types'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type ExamConfirmModalProps = {
  visible: boolean
  exam: StudentExamListItem | null
  purpose: 'EXAM' | 'PRACTICE'
  onConfirm: () => void
  onClose: () => void
}

export function ExamConfirmModal({
  visible,
  exam,
  purpose,
  onConfirm,
  onClose,
}: ExamConfirmModalProps) {
  if (!exam) return null

  const isPractice = purpose === 'PRACTICE'
  const isResume = exam.myStatus === 'IN_PROGRESS'

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Icon */}
          <View style={[styles.iconCircle, isPractice ? styles.iconPractice : styles.iconExam]}>
            <Ionicons
              name={isPractice ? 'book-outline' : 'document-text-outline'}
              size={28}
              color={isPractice ? colors.accent : colors.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.purposeTag}>
            {isPractice ? 'Luyện tập' : 'Bài thi chính thức'}
          </Text>
          <Text style={styles.title} numberOfLines={2}>{exam.title}</Text>

          {/* Info rows */}
          <View style={styles.infoCard}>
            <InfoRow icon="calendar-outline" label="Lịch" value={formatStudentExamSchedule(exam.startAt, exam.endAt)} />
            <InfoRow
              icon="time-outline"
              label="Thời gian"
              value={exam.timeLimitEnabled ? `${exam.duration} phút` : 'Không giới hạn'}
            />
            {exam.totalQuestions > 0 ? (
              <InfoRow icon="list-outline" label="Số câu" value={`${exam.totalQuestions} câu`} />
            ) : null}
            <InfoRow icon="trophy-outline" label="Điểm tối đa" value={`${exam.maxScore} điểm`} />
            <InfoRow
              icon="radio-button-on-outline"
              label="Trạng thái"
              value={STUDENT_EXAM_STATUS_LABEL[exam.examStatus]}
            />
            {isPractice && exam.maxAttempts != null ? (
              <InfoRow icon="repeat-outline" label="Số lượt" value={`${exam.maxAttempts} lượt`} />
            ) : null}
          </View>

          {/* Resume notice */}
          {isResume ? (
            <View style={styles.resumeBanner}>
              <Ionicons name="play-circle" size={18} color="#92400E" />
              <Text style={styles.resumeText}>Bạn đang có lượt làm dở — sẽ tiếp tục bài cũ</Text>
            </View>
          ) : null}

          {/* Warning for exam */}
          {!isPractice && !isResume ? (
            <View style={styles.examWarning}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.textMuted} />
              <Text style={styles.examWarningText}>
                Sau khi bắt đầu, thời gian sẽ được tính ngay. Hãy chắc chắn bạn đã sẵn sàng.
              </Text>
            </View>
          ) : null}

          {/* Buttons */}
          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnCancel, pressed && styles.btnCancelPressed]}
              onPress={onClose}
            >
              <Text style={styles.btnCancelText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                isPractice ? styles.btnPractice : styles.btnExam,
                pressed && (isPractice ? styles.btnPracticePressed : styles.btnExamPressed),
              ]}
              onPress={onConfirm}
            >
              <Ionicons
                name={isResume ? 'play' : 'enter-outline'}
                size={18}
                color="#fff"
              />
              <Text style={styles.btnConfirmText}>
                {isResume ? 'Tiếp tục làm bài' : 'Vào làm bài'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={15} color={colors.textSubtle} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconPractice: {
    backgroundColor: '#ECFDF5',
  },
  iconExam: {
    backgroundColor: '#EFF6FF',
  },
  purposeTag: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textSubtle,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  resumeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#92400E',
    lineHeight: 18,
  },
  examWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  examWarningText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 48,
    borderRadius: 14,
  },
  btnCancel: {
    backgroundColor: '#F1F5F9',
    flex: 0.7,
  },
  btnCancelPressed: {
    backgroundColor: '#E2E8F0',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  btnPractice: {
    backgroundColor: colors.accent,
    flex: 1.3,
  },
  btnPracticePressed: {
    opacity: 0.9,
  },
  btnExam: {
    backgroundColor: colors.primary,
    flex: 1.3,
  },
  btnExamPressed: {
    backgroundColor: colors.primaryPressed,
  },
  btnConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
})
