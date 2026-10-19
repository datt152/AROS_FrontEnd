import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { getApiErrorMessage } from '@aros/shared/api/apiError'
import { forgotPassword } from '@aros/shared/features/auth/api/auth.api'
import { validateLoginForm, type LoginFieldErrors } from '@aros/shared/features/auth/lib/loginValidation'
import { getStorage } from '@aros/shared/platform/storage'

import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { colors } from '@/theme/colors'

import { useAuth } from '../store/authContext'

const REMEMBERED_EMAIL_KEY = 'aros.rememberedEmail'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_COOLDOWN_SECONDS = 60

export function LoginScreen() {
  const { state, signIn, retryRestore } = useAuth()
  const passwordRef = useRef<TextInput>(null)

  const [email, setEmail] = useState(() => getStorage()?.getItem(REMEMBERED_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginFieldErrors>({})
  const [showForgot, setShowForgot] = useState(false)

  const loginMutation = useMutation({
    mutationFn: signIn,
    onSuccess: (_data, payload) => {
      getStorage()?.setItem(REMEMBERED_EMAIL_KEY, payload.email)
    },
  })

  function handleSubmit() {
    const nextErrors = validateLoginForm(email, password)
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    loginMutation.mutate({ email: email.trim(), password })
  }

  const apiError = loginMutation.error ? getApiErrorMessage(loginMutation.error) : null

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {showForgot ? (
            <ForgotPasswordSection
              initialEmail={email}
              onBack={() => setShowForgot(false)}
            />
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.brand}>AROS</Text>
                <Text style={styles.title}>Đăng nhập</Text>
                <Text style={styles.subtitle}>Dùng tài khoản giáo viên hoặc sinh viên của bạn.</Text>
              </View>

              {state.status === 'offline' ? (
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>{state.message}</Text>
                  <Pressable onPress={retryRestore} accessibilityRole="button">
                    <Text style={styles.noticeAction}>Thử kết nối lại</Text>
                  </Pressable>
                </View>
              ) : null}

              {state.status === 'restoring' ? (
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>Đang khôi phục phiên đăng nhập…</Text>
                </View>
              ) : null}

              {apiError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{apiError}</Text>
                </View>
              ) : null}

              <View style={styles.form}>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  placeholder="ban@truong.edu.vn"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="username"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  submitBehavior="submit"
                />

                <TextField
                  ref={passwordRef}
                  label="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  placeholder="Nhập mật khẩu"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  trailing={
                    <Pressable
                      onPress={() => setShowPassword((value) => !value)}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textSubtle}
                      />
                    </Pressable>
                  }
                />

                <Pressable
                  onPress={() => setShowForgot(true)}
                  style={styles.forgotLink}
                  hitSlop={6}
                >
                  <Text style={styles.forgotLinkText}>Quên mật khẩu?</Text>
                </Pressable>

                <Button
                  title="Đăng nhập"
                  onPress={handleSubmit}
                  loading={loginMutation.isPending}
                  disabled={state.status === 'restoring'}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Forgot Password Section ─────────────────────────────────

function ForgotPasswordSection({
  initialEmail,
  onBack,
}: {
  initialEmail: string
  onBack: () => void
}) {
  const [email, setEmail] = useState(initialEmail)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const remainingSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0
  const coolingDown = remainingSeconds > 0

  useEffect(() => {
    if (!cooldownUntil) return
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= cooldownUntil) {
        setCooldownUntil(null)
        clearInterval(timer)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownUntil])

  async function handleSend() {
    if (coolingDown || sending) return

    const value = email.trim()
    if (!value) {
      setEmailError('Vui lòng nhập email')
      return
    }
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError('Vui lòng nhập email hợp lệ')
      return
    }
    setEmailError(null)
    setApiError(null)

    setSending(true)
    try {
      const msg = await forgotPassword({ email: value })
      setSuccess(msg)
      const start = Date.now()
      setNow(start)
      setCooldownUntil(start + RESEND_COOLDOWN_SECONDS * 1000)
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Không gửi được yêu cầu. Vui lòng thử lại.'))
    } finally {
      setSending(false)
    }
  }

  const btnLabel = sending
    ? ''
    : coolingDown
      ? `Gửi lại sau ${remainingSeconds}s`
      : success
        ? 'Gửi lại liên kết'
        : 'Gửi liên kết đặt lại'

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.brand}>AROS</Text>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>
          Nhập email tài khoản, hệ thống sẽ gửi liên kết đặt lại mật khẩu (hiệu lực 15 phút).
        </Text>
      </View>

      {success ? (
        <View style={styles.successBox}>
          <Ionicons name="mail-outline" size={18} color="#059669" />
          <View style={styles.successContent}>
            <Text style={styles.successText}>{success}</Text>
            <Text style={styles.successHint}>
              Kiểm tra cả hộp thư rác. Gửi lại liên kết mới sẽ làm liên kết cũ hết hiệu lực.
            </Text>
          </View>
        </View>
      ) : null}

      {apiError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{apiError}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t)
            if (emailError) setEmailError(null)
          }}
          error={emailError ?? undefined}
          placeholder="Nhập email của bạn"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="send"
          onSubmitEditing={() => void handleSend()}
          editable={!sending}
        />

        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            pressed && !coolingDown && !sending && styles.sendBtnPressed,
            (coolingDown || sending) && styles.sendBtnDisabled,
          ]}
          onPress={() => void handleSend()}
          disabled={coolingDown || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendBtnText}>{btnLabel}</Text>
          )}
        </Pressable>

        <Pressable onPress={onBack} style={styles.backLink} hitSlop={6}>
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={styles.backLinkText}>Quay lại đăng nhập</Text>
        </Pressable>
      </View>
    </>
  )
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  brand: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  form: {
    gap: 16,
  },
  notice: {
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    backgroundColor: colors.warningSoft,
    padding: 12,
  },
  noticeText: {
    fontSize: 14,
    color: colors.warningText,
  },
  noticeAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSoft,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },

  // ── Forgot password link on login
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // ── Forgot password section
  successBox: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
    padding: 12,
  },
  successContent: {
    flex: 1,
    gap: 4,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
  },
  successHint: {
    fontSize: 12,
    color: '#047857',
  },
  sendBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnPressed: {
    backgroundColor: colors.primaryPressed,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
})
