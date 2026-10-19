import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import {
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
import { validateLoginForm, type LoginFieldErrors } from '@aros/shared/features/auth/lib/loginValidation'
import { getStorage } from '@aros/shared/platform/storage'

import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { colors } from '@/theme/colors'

import { useAuth } from '../store/authContext'

const REMEMBERED_EMAIL_KEY = 'aros.rememberedEmail'

export function LoginScreen() {
  const { state, signIn, retryRestore } = useAuth()
  const passwordRef = useRef<TextInput>(null)

  const [email, setEmail] = useState(() => getStorage()?.getItem(REMEMBERED_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginFieldErrors>({})

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

            <Button
              title="Đăng nhập"
              onPress={handleSubmit}
              loading={loginMutation.isPending}
              disabled={state.status === 'restoring'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

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
})
