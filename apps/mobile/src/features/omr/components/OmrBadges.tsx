import {
  EXAM_SESSION_STATUS_LABEL,
  OMR_SHEET_STATUS_LABEL,
  type ExamSessionStatus,
  type OmrSheetStatus,
} from '@aros/shared/features/omr/types/omr.types'
import { StyleSheet, Text, View } from 'react-native'

const SESSION_COLORS: Record<ExamSessionStatus, { bg: string; border: string; text: string }> = {
  OPEN: { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857' },
  CLOSED: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  GRADED: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
}

const SHEET_COLORS: Record<OmrSheetStatus, { bg: string; border: string; text: string }> = {
  PROCESSING: { bg: '#F1F5F9', border: '#E2E8F0', text: '#475569' },
  GRADED: { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857' },
  NEEDS_REVIEW: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  RETAKE_REQUIRED: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
  FAILED: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
}

export function SessionStatusBadge({ status }: { status: ExamSessionStatus }) {
  const c = SESSION_COLORS[status]
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{EXAM_SESSION_STATUS_LABEL[status]}</Text>
    </View>
  )
}

export function SheetStatusBadge({ status }: { status: OmrSheetStatus }) {
  const c = SHEET_COLORS[status]
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{OMR_SHEET_STATUS_LABEL[status]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
