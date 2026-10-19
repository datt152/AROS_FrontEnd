import { Ionicons } from '@expo/vector-icons'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import { changeMyPassword, updateMe } from '@aros/shared/features/auth/api/users.api'
import { validateNewPassword } from '@aros/shared/features/auth/lib/passwordValidation'
import type { UserProfile } from '@aros/shared/features/auth/types/auth.types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { colors } from '@/theme/colors'

import { meKeys, useMe } from '../hooks/useMe'
import { useAuth } from '../store/authContext'

const ROLE_LABEL: Record<string, string> = {
  teacher: 'Giáo viên',
  student: 'Sinh viên',
  admin: 'Quản trị viên',
}

const STUDENT_CODE_PATTERN = /^\d{8}$/

type Section = 'view' | 'edit' | 'password'

export function AccountScreen() {
  const { state, signOut } = useAuth()
  const meQuery = useMe()
  const queryClient = useQueryClient()

  const role = state.status === 'signedIn' ? state.session.role : null
  const isStudent = role === 'student'
  const profile = meQuery.data

  const [section, setSection] = useState<Section>('view')
  const logoutMutation = useMutation({ mutationFn: signOut })

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Profile card ──────────────────────────────────── */}
        <View style={styles.profileCard}>
          {meQuery.isPending ? (
            <ActivityIndicator color={colors.primary} />
          ) : meQuery.isError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{getApiErrorMessage(meQuery.error)}</Text>
              <Pressable onPress={() => void meQuery.refetch()}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            </View>
          ) : profile ? (
            <>
              <Text style={styles.fullName}>{profile.fullName || profile.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <InfoRow icon="mail-outline" label="Email" value={profile.email} />
                {isStudent ? (
                  <InfoRow
                    icon="card-outline"
                    label="Mã sinh viên"
                    value={profile.studentCode ?? 'Chưa cập nhật'}
                    valueStyle={!profile.studentCode ? styles.placeholder : undefined}
                  />
                ) : null}
              </View>
            </>
          ) : null}
        </View>

        {/* ─── Actions / Forms ─────────────────────────────── */}
        {profile && section === 'view' ? (
          <View style={styles.actionGroup}>
            <ActionRow
              icon="create-outline"
              label="Chỉnh sửa thông tin"
              onPress={() => setSection('edit')}
            />
            <ActionRow
              icon="lock-closed-outline"
              label="Đổi mật khẩu"
              onPress={() => setSection('password')}
            />
          </View>
        ) : null}

        {profile && section === 'edit' ? (
          <EditProfileForm
            profile={profile}
            isStudent={isStudent}
            onDone={() => {
              setSection('view')
              void queryClient.invalidateQueries({ queryKey: meKeys.all })
            }}
            onCancel={() => setSection('view')}
          />
        ) : null}

        {profile && section === 'password' ? (
          <ChangePasswordForm
            onDone={() => setSection('view')}
            onCancel={() => setSection('view')}
          />
        ) : null}

        {/* ─── Logout ──────────────────────────────────────── */}
        <Button
          title="Đăng xuất"
          variant="danger"
          onPress={() =>
            Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng xuất', style: 'destructive', onPress: () => logoutMutation.mutate() },
            ])
          }
          loading={logoutMutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Edit Profile Form ───────────────────────────────────────

function EditProfileForm({
  profile,
  isStudent,
  onDone,
  onCancel,
}: {
  profile: UserProfile
  isStudent: boolean
  onDone: () => void
  onCancel: () => void
}) {
  const [fullName, setFullName] = useState(profile.fullName)
  const [studentCode, setStudentCode] = useState(profile.studentCode ?? '')
  const [errors, setErrors] = useState<{ fullName?: string; studentCode?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const nameRef = useRef<TextInput>(null)
  const codeRef = useRef<TextInput>(null)

  async function handleSave() {
    const nextErrors: { fullName?: string; studentCode?: string } = {}
    const name = fullName.trim()
    const code = studentCode.trim()

    if (!name) nextErrors.fullName = 'Vui lòng nhập họ tên'
    if (isStudent && code && !STUDENT_CODE_PATTERN.test(code)) {
      nextErrors.studentCode = 'Mã sinh viên phải gồm đúng 8 chữ số'
    }

    setErrors(nextErrors)
    setApiError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      const payload = isStudent && code
        ? { fullName: name, studentCode: code }
        : { fullName: name }
      await updateMe(payload)
      onDone()
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Không thể cập nhật thông tin'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Chỉnh sửa thông tin</Text>

      {apiError ? (
        <View style={styles.alertError}>
          <Text style={styles.alertErrorText}>{apiError}</Text>
        </View>
      ) : null}

      <TextField
        ref={nameRef}
        label="Họ tên"
        value={fullName}
        onChangeText={(t) => {
          setFullName(t)
          if (errors.fullName) setErrors((e) => ({ ...e, fullName: undefined }))
        }}
        error={errors.fullName}
        placeholder="Nhập họ tên"
        returnKeyType={isStudent ? 'next' : 'done'}
        onSubmitEditing={() => (isStudent ? codeRef.current?.focus() : void handleSave())}
        editable={!saving}
      />

      {isStudent ? (
        <TextField
          ref={codeRef}
          label="Mã sinh viên (8 số)"
          value={studentCode}
          onChangeText={(t) => {
            setStudentCode(t.replace(/\D/g, '').slice(0, 8))
            if (errors.studentCode) setErrors((e) => ({ ...e, studentCode: undefined }))
          }}
          error={errors.studentCode}
          placeholder="Để trống nếu không đổi"
          keyboardType="number-pad"
          maxLength={8}
          returnKeyType="done"
          onSubmitEditing={() => void handleSave()}
          editable={!saving}
        />
      ) : null}

      <View style={styles.formBtnRow}>
        <Pressable
          style={({ pressed }) => [styles.formBtn, styles.formBtnCancel, pressed && styles.formBtnCancelPressed]}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.formBtnCancelText}>Hủy</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.formBtn, styles.formBtnPrimary, pressed && styles.formBtnPrimaryPressed, saving && styles.formBtnDisabled]}
          onPress={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.formBtnPrimaryText}>Lưu thay đổi</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

// ─── Change Password Form ────────────────────────────────────

function ChangePasswordForm({
  onDone,
  onCancel,
}: {
  onDone: () => void
  onCancel: () => void
}) {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const newRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)

  const clearField = useCallback((field: string) => {
    setErrors((e) => ({ ...e, [field]: undefined }))
    setApiError(null)
    setSuccess(null)
  }, [])

  async function handleSubmit() {
    const nextErrors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {
      ...(currentPw ? {} : { currentPassword: 'Vui lòng nhập mật khẩu hiện tại' }),
      ...validateNewPassword(newPw, confirmPw),
    }
    if (!nextErrors.newPassword && currentPw && newPw === currentPw) {
      nextErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    }

    setErrors(nextErrors)
    setApiError(null)
    setSuccess(null)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      const msg = await changeMyPassword({
        currentPassword: currentPw,
        newPassword: newPw,
        confirmPassword: confirmPw,
      })
      setSuccess(typeof msg === 'string' ? msg : 'Đổi mật khẩu thành công!')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setErrors({})
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Không đổi được mật khẩu'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Đổi mật khẩu</Text>

      {success ? (
        <View style={styles.alertSuccess}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" />
          <Text style={styles.alertSuccessText}>{success}</Text>
        </View>
      ) : null}

      {apiError ? (
        <View style={styles.alertError}>
          <Text style={styles.alertErrorText}>{apiError}</Text>
        </View>
      ) : null}

      <TextField
        label="Mật khẩu hiện tại"
        value={currentPw}
        onChangeText={(t) => { setCurrentPw(t); clearField('currentPassword') }}
        error={errors.currentPassword}
        placeholder="Nhập mật khẩu hiện tại"
        secureTextEntry
        returnKeyType="next"
        onSubmitEditing={() => newRef.current?.focus()}
        editable={!saving}
      />

      <TextField
        ref={newRef}
        label="Mật khẩu mới"
        value={newPw}
        onChangeText={(t) => { setNewPw(t); clearField('newPassword') }}
        error={errors.newPassword}
        placeholder="Tối thiểu 6 ký tự"
        secureTextEntry
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        editable={!saving}
      />

      <TextField
        ref={confirmRef}
        label="Xác nhận mật khẩu mới"
        value={confirmPw}
        onChangeText={(t) => { setConfirmPw(t); clearField('confirmPassword') }}
        error={errors.confirmPassword}
        placeholder="Nhập lại mật khẩu mới"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
        editable={!saving}
      />

      <View style={styles.formBtnRow}>
        <Pressable
          style={({ pressed }) => [styles.formBtn, styles.formBtnCancel, pressed && styles.formBtnCancelPressed]}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.formBtnCancelText}>Hủy</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.formBtn, styles.formBtnPrimary, pressed && styles.formBtnPrimaryPressed, saving && styles.formBtnDisabled]}
          onPress={() => void handleSubmit()}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.formBtnPrimaryText}>Đổi mật khẩu</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

// ─── Small components ────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: string
  label: string
  value: string
  valueStyle?: object
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={18} color={colors.textSubtle} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, valueStyle]} numberOfLines={1}>{value}</Text>
    </View>
  )
}

function ActionRow({
  icon,
  label,
  onPress,
}: {
  icon: string
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
      onPress={onPress}
    >
      <View style={styles.actionLeft}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </Pressable>
  )
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },

  profileCard: {
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  infoSection: {
    width: '100%',
    marginTop: 10,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSubtle,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  placeholder: {
    color: colors.textSubtle,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  errorBox: {
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  actionGroup: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actionRowPressed: {
    backgroundColor: '#F8FAFC',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },

  formCard: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  formBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBtnCancel: {
    backgroundColor: '#F1F5F9',
  },
  formBtnCancelPressed: {
    backgroundColor: '#E2E8F0',
  },
  formBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  formBtnPrimary: {
    backgroundColor: colors.primary,
  },
  formBtnPrimaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  formBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  formBtnDisabled: {
    opacity: 0.6,
  },

  alertError: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  alertErrorText: {
    fontSize: 13,
    color: colors.danger,
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  alertSuccessText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    fontWeight: '500',
  },
})
