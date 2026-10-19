import { forwardRef, type ReactNode } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'

import { colors } from '@/theme/colors'

type TextFieldProps = TextInputProps & {
  label: string
  error?: string
  /** Nút nằm bên phải ô nhập (ví dụ: hiện/ẩn mật khẩu). */
  trailing?: ReactNode
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, trailing, style, ...props },
  ref,
) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, style]}
          {...props}
        />
        {trailing}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
})
