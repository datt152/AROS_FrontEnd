import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type SubmitConfirmModalProps = {
  visible: boolean
  unansweredCount: number
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function SubmitConfirmModal({
  visible,
  unansweredCount,
  isSubmitting,
  onClose,
  onConfirm,
}: SubmitConfirmModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconCircle}>
            <Ionicons name="paper-plane-outline" size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>Nộp bài?</Text>

          {unansweredCount > 0 ? (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={18} color="#92400E" />
              <Text style={styles.warningText}>
                Bạn còn {unansweredCount} câu chưa trả lời
              </Text>
            </View>
          ) : (
            <Text style={styles.desc}>Bạn đã trả lời đủ tất cả câu hỏi.</Text>
          )}

          <Text style={styles.desc}>Sau khi nộp, bạn không thể chỉnh sửa bài làm.</Text>

          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnCancel, pressed && styles.btnCancelPressed]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.btnCancelText}>Quay lại</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnConfirm,
                pressed && styles.btnConfirmPressed,
                isSubmitting && styles.btnDisabled,
              ]}
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={16} color="#fff" />
                  <Text style={styles.btnConfirmText}>Nộp bài</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
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
    gap: 6,
    height: 46,
    borderRadius: 12,
  },
  btnCancel: {
    backgroundColor: '#F1F5F9',
  },
  btnCancelPressed: {
    backgroundColor: '#E2E8F0',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  btnConfirm: {
    backgroundColor: colors.primary,
  },
  btnConfirmPressed: {
    backgroundColor: colors.primaryPressed,
  },
  btnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  btnDisabled: {
    opacity: 0.7,
  },
})
