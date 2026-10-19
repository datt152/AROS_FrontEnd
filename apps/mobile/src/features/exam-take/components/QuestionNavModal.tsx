import { Ionicons } from '@expo/vector-icons'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type QuestionNavModalProps = {
  visible: boolean
  total: number
  currentIndex: number
  answers: Record<number, string | string[]>
  flagged: Set<number>
  questionIds: number[]
  answeredCount: number
  onSelect: (index: number) => void
  onClose: () => void
  onFinish: () => void
}

function hasAnswer(value: string | string[] | undefined) {
  if (!value) return false
  return Array.isArray(value) ? value.length > 0 : value.length > 0
}

export function QuestionNavModal({
  visible,
  total,
  currentIndex,
  answers,
  flagged,
  questionIds,
  answeredCount,
  onSelect,
  onClose,
  onFinish,
}: QuestionNavModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Danh sách câu hỏi</Text>
              <Text style={styles.headerSub}>
                {answeredCount}/{total} đã trả lời
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Grid */}
          <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent}>
            <View style={styles.grid}>
              {Array.from({ length: total }, (_, i) => {
                const qid = questionIds[i]
                const answered = hasAnswer(answers[qid])
                const isFlagged = flagged.has(qid)
                const isCurrent = i === currentIndex

                return (
                  <Pressable
                    key={qid}
                    style={({ pressed }) => [
                      styles.cell,
                      isCurrent && styles.cellCurrent,
                      !isCurrent && answered && styles.cellAnswered,
                      !isCurrent && !answered && styles.cellUnanswered,
                      pressed && styles.cellPressed,
                    ]}
                    onPress={() => onSelect(i)}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        isCurrent && styles.cellTextCurrent,
                        !isCurrent && answered && styles.cellTextAnswered,
                      ]}
                    >
                      {i + 1}
                    </Text>
                    {isFlagged ? (
                      <View style={styles.flagDot}>
                        <Ionicons name="flag" size={10} color="#EF4444" />
                      </View>
                    ) : null}
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Đang xem</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Đã trả lời</Text>
            </View>
            <View style={styles.legendItem}>
              <Ionicons name="flag" size={12} color="#EF4444" />
              <Text style={styles.legendText}>Gắn cờ</Text>
            </View>
          </View>

          {/* Finish button */}
          <Pressable
            style={({ pressed }) => [styles.finishBtn, pressed && styles.finishBtnPressed]}
            onPress={onFinish}
          >
            <Ionicons name="checkmark-done" size={18} color="#fff" />
            <Text style={styles.finishBtnText}>Xem lại & Nộp bài</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  closeBtnPressed: {
    backgroundColor: '#E2E8F0',
  },
  gridScroll: {
    maxHeight: 280,
  },
  gridContent: {
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCurrent: {
    backgroundColor: colors.primary,
  },
  cellAnswered: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cellUnanswered: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellPressed: {
    opacity: 0.7,
  },
  cellText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  cellTextCurrent: {
    color: '#fff',
  },
  cellTextAnswered: {
    color: '#065F46',
  },
  flagDot: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.accent,
  },
  finishBtnPressed: {
    opacity: 0.9,
  },
  finishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
