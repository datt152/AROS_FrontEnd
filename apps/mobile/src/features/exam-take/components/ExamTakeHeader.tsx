import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type ExamTakeHeaderProps = {
  title: string
  versionCode: string
  purpose: 'EXAM' | 'PRACTICE'
  currentIndex: number
  total: number
  secondsLeft: number | null
  onMenuPress: () => void
  onClosePress?: () => void
}

export function ExamTakeHeader({
  title,
  versionCode,
  purpose,
  currentIndex,
  total,
  secondsLeft,
  onMenuPress,
  onClosePress,
}: ExamTakeHeaderProps) {
  const minutes = secondsLeft != null ? Math.floor(secondsLeft / 60) : 0
  const seconds = secondsLeft != null ? secondsLeft % 60 : 0
  const isUrgent = secondsLeft != null && secondsLeft <= 60

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.purposeTag}>
            {purpose === 'PRACTICE' ? 'Luyện tập' : 'Bài thi'}
          </Text>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.versionCode}>Mã đề {versionCode}</Text>
        </View>

        {secondsLeft != null ? (
          <View style={[styles.timerBox, isUrgent && styles.timerUrgent]}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isUrgent ? '#EF4444' : colors.textMuted}
            />
            <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
          </View>
        ) : (
          <View style={styles.timerBox}>
            <Ionicons name="infinite-outline" size={16} color={colors.accent} />
            <Text style={[styles.timerText, { color: colors.accent }]}>Tự do</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Câu {currentIndex + 1}/{total}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / Math.max(total, 1)) * 100}%` },
              ]}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
          onPress={onMenuPress}
          hitSlop={8}
        >
          <Ionicons name="grid-outline" size={18} color={colors.primary} />
        </Pressable>

        {onClosePress ? (
          <Pressable
            style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
            onPress={onClosePress}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  purposeTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  versionCode: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  timerTextUrgent: {
    color: '#EF4444',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressInfo: {
    flex: 1,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  menuBtnPressed: {
    backgroundColor: '#E2E8F0',
  },
})
