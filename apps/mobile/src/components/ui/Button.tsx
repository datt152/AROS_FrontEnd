import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native'

import { colors } from '@/theme/colors'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string
  variant?: ButtonVariant
  loading?: boolean
}

export function Button({ title, variant = 'primary', loading = false, disabled, style, ...props }: ButtonProps) {
  const isDisabled = disabled || loading
  const textColor = variant === 'secondary' ? colors.text : colors.surface

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        variantStyles[variant],
        state.pressed && pressedStyles[variant],
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
})

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.danger },
})

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.background },
  danger: { opacity: 0.85 },
})
