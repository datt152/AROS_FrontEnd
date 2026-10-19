import { useMutation } from '@tanstack/react-query'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getApiErrorMessage } from '@aros/shared/api/apiError'

import { Button } from '@/components/ui/Button'
import { colors } from '@/theme/colors'

import { useMe } from '../hooks/useMe'
import { useAuth } from '../store/authContext'

const ROLE_LABEL = {
  teacher: 'Giáo viên',
  student: 'Sinh viên',
} as const

export function AccountScreen() {
  const { state, signOut } = useAuth()
  const meQuery = useMe()
  const logoutMutation = useMutation({ mutationFn: signOut })

  const role = state.status === 'signedIn' ? state.session.role : null
  const profile = meQuery.data

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {meQuery.isPending ? (
          <ActivityIndicator color={colors.primary} />
        ) : meQuery.isError ? (
          <Text style={styles.error}>{getApiErrorMessage(meQuery.error)}</Text>
        ) : (
          <>
            <Text style={styles.name}>{profile?.fullName || profile?.email}</Text>
            <InfoRow label="Email" value={profile?.email} />
            {role ? <InfoRow label="Vai trò" value={ROLE_LABEL[role]} /> : null}
            {role === 'student' ? (
              <InfoRow label="Mã sinh viên" value={profile?.studentCode ?? 'Chưa cập nhật'} />
            ) : null}
          </>
        )}
      </View>

      <Button
        title="Đăng xuất"
        variant="secondary"
        onPress={() => logoutMutation.mutate()}
        loading={logoutMutation.isPending}
      />
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'right',
  },
  error: {
    fontSize: 14,
    color: colors.danger,
  },
})
