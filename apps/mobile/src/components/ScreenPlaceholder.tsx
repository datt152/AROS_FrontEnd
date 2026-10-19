import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

type ScreenPlaceholderProps = {
  title: string
  description: string
}

/** Màn hình giữ chỗ cho module chưa hiện thực. */
export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.textMuted,
  },
})
