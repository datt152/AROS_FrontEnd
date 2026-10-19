import { Ionicons } from '@expo/vector-icons'
import type { QuestionType } from '@aros/shared/features/exams/types/exam.types'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type QuestionOption = { label: string; content: string }

type QuestionViewProps = {
  index: number
  total: number
  content: string
  type: QuestionType
  options: QuestionOption[]
  answer: string | string[] | undefined
  flagged: boolean
  onSelectSingle: (label: string) => void
  onToggleMulti: (label: string) => void
  onClearAnswer: () => void
  onToggleFlag: () => void
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
}

function hasAnswer(value: string | string[] | undefined) {
  if (!value) return false
  return Array.isArray(value) ? value.length > 0 : value.length > 0
}

export function QuestionView({
  index,
  total,
  content,
  type,
  options,
  answer,
  flagged,
  onSelectSingle,
  onToggleMulti,
  onClearAnswer,
  onToggleFlag,
  onPrev,
  onNext,
  onFinish,
}: QuestionViewProps) {
  const isMulti = type === 'MULTIPLE_CHOICE'
  const isLast = index >= total - 1

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Question header */}
        <View style={styles.qHeader}>
          <View style={styles.qBadge}>
            <Text style={styles.qBadgeText}>Câu {index + 1}</Text>
          </View>
          <Text style={styles.qType}>
            {isMulti ? 'Chọn nhiều đáp án' : 'Chọn một đáp án'}
          </Text>
        </View>

        {/* Question content */}
        <Text style={styles.qContent}>{content}</Text>

        {/* Options */}
        <View style={styles.optionList}>
          {options.map((option) => {
            const selected = isMulti
              ? Array.isArray(answer) && answer.includes(option.label)
              : answer === option.label

            return (
              <Pressable
                key={option.label}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && !selected && styles.optionPressed,
                ]}
                onPress={() =>
                  isMulti ? onToggleMulti(option.label) : onSelectSingle(option.label)
                }
              >
                <View style={[styles.optionRadio, selected && styles.optionRadioSelected]}>
                  {selected ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : null}
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {option.label}.
                  </Text>
                  <Text style={[styles.optionContent, selected && styles.optionContentSelected]}>
                    {option.content}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Action row: flag + clear */}
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionChip,
              flagged && styles.actionChipActive,
              pressed && styles.actionChipPressed,
            ]}
            onPress={onToggleFlag}
          >
            <Ionicons
              name={flagged ? 'flag' : 'flag-outline'}
              size={16}
              color={flagged ? '#EF4444' : colors.textMuted}
            />
            <Text style={[styles.actionChipText, flagged && { color: '#EF4444' }]}>
              {flagged ? 'Bỏ cờ' : 'Gắn cờ'}
            </Text>
          </Pressable>

          {hasAnswer(answer) ? (
            <Pressable
              style={({ pressed }) => [styles.actionChip, pressed && styles.actionChipPressed]}
              onPress={onClearAnswer}
            >
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              <Text style={styles.actionChipText}>Xóa đáp án</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {/* Navigation footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            styles.navBtnSecondary,
            index === 0 && styles.navBtnDisabled,
            pressed && styles.navBtnSecondaryPressed,
          ]}
          onPress={onPrev}
          disabled={index === 0}
        >
          <Ionicons name="chevron-back" size={18} color={index === 0 ? colors.textSubtle : colors.text} />
          <Text style={[styles.navBtnText, index === 0 && styles.navBtnTextDisabled]}>Trước</Text>
        </Pressable>

        {!isLast ? (
          <Pressable
            style={({ pressed }) => [
              styles.navBtn,
              styles.navBtnPrimary,
              pressed && styles.navBtnPrimaryPressed,
            ]}
            onPress={onNext}
          >
            <Text style={styles.navBtnTextPrimary}>Sau</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.navBtn,
              styles.navBtnFinish,
              pressed && styles.navBtnFinishPressed,
            ]}
            onPress={onFinish}
          >
            <Ionicons name="checkmark-done" size={18} color="#fff" />
            <Text style={styles.navBtnTextPrimary}>Xem lại & Nộp</Text>
          </Pressable>
        )}
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
    paddingBottom: 8,
  },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  qBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  qBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  qType: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  qContent: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  optionList: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  optionPressed: {
    backgroundColor: '#F8FAFC',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  optionRadioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionTextWrap: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMuted,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    flex: 1,
  },
  optionContentSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionChipPressed: {
    opacity: 0.7,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 14,
  },
  navBtnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  navBtnSecondaryPressed: {
    backgroundColor: '#E2E8F0',
  },
  navBtnPrimary: {
    backgroundColor: colors.primary,
  },
  navBtnPrimaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  navBtnFinish: {
    backgroundColor: colors.accent,
  },
  navBtnFinishPressed: {
    opacity: 0.9,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  navBtnTextDisabled: {
    color: colors.textSubtle,
  },
  navBtnTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})
