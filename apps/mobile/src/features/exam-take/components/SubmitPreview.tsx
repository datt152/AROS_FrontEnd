import { Ionicons } from '@expo/vector-icons'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type PreviewQuestion = {
  questionId: number
  content: string
  type: string
  options: { label: string; content: string }[]
}

type SubmitPreviewProps = {
  questions: PreviewQuestion[]
  answers: Record<number, string | string[]>
  flagged: Set<number>
  canSubmit: boolean
  isSubmitting: boolean
  onEdit: (index: number) => void
  onSubmitPress: () => void
}

function formatAnswer(value: string | string[] | undefined) {
  if (!value) return null
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : null
  return value || null
}

export function SubmitPreview({
  questions,
  answers,
  flagged,
  canSubmit,
  isSubmitting,
  onEdit,
  onSubmitPress,
}: SubmitPreviewProps) {
  const unanswered = questions.filter((q) => !formatAnswer(answers[q.questionId])).length

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Xem lại bài làm</Text>
        <Text style={styles.summary}>
          {unanswered > 0
            ? `Còn ${unanswered} câu chưa trả lời`
            : 'Đã trả lời đủ tất cả câu hỏi'}
        </Text>

        {questions.map((question, index) => {
          const answerText = formatAnswer(answers[question.questionId])
          const isFlagged = flagged.has(question.questionId)

          return (
            <View key={question.questionId} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardBadgeRow}>
                    <Text style={styles.cardIndex}>Câu {index + 1}</Text>
                    {isFlagged ? (
                      <View style={styles.flagBadge}>
                        <Ionicons name="flag" size={10} color="#EF4444" />
                        <Text style={styles.flagText}>Cờ</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.cardContent} numberOfLines={2}>
                    {question.content}
                  </Text>
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Đáp án: </Text>
                    {answerText ? (
                      <Text style={styles.answerValue}>{answerText}</Text>
                    ) : (
                      <Text style={styles.answerEmpty}>Chưa chọn</Text>
                    )}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
                  onPress={() => onEdit(index)}
                >
                  <Ionicons name="pencil" size={14} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && styles.submitBtnPressed,
            (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
          ]}
          onPress={onSubmitPress}
          disabled={!canSubmit || isSubmitting}
        >
          <Ionicons name="paper-plane" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Đang nộp…' : 'Nộp bài'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 10,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  summary: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 10,
  },
  cardLeft: {
    flex: 1,
    gap: 6,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIndex: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSubtle,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  flagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  cardContent: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  answerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  answerEmpty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  editBtnPressed: {
    backgroundColor: '#DBEAFE',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  submitBtnPressed: {
    backgroundColor: colors.primaryPressed,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
