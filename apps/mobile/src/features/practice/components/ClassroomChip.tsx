import { Ionicons } from '@expo/vector-icons'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

import { colors } from '@/theme/colors'

import type { ClassroomItem } from '../api/practiceApi'

type ClassroomChipProps = {
  item: ClassroomItem
  selected: boolean
  onPress: (item: ClassroomItem) => void
}

function ClassroomChip({ item, selected, onPress }: ClassroomChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {selected ? (
        <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.chipIcon} />
      ) : null}
      <View style={styles.chipTextWrap}>
        <Text style={[styles.chipTitle, selected && styles.chipTitleSelected]} numberOfLines={1}>
          {item.className}
        </Text>
        <Text style={[styles.chipSub, selected && styles.chipSubSelected]} numberOfLines={1}>
          {item.subjectName}
        </Text>
      </View>
    </Pressable>
  )
}

export function ClassroomStrip({
  classrooms,
  selectedId,
  onSelect,
}: {
  classrooms: ClassroomItem[]
  selectedId: number | undefined
  onSelect: (item: ClassroomItem) => void
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={classrooms}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ClassroomChip
          item={item}
          selected={item.id === selectedId}
          onPress={onSelect}
        />
      )}
      contentContainerStyle={styles.strip}
      ItemSeparatorComponent={StripGap}
    />
  )
}

function StripGap() {
  return <View style={styles.stripGap} />
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  stripGap: {
    width: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
    shadowOpacity: 0.08,
    elevation: 2,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipTextWrap: {
    gap: 1,
  },
  chipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  chipTitleSelected: {
    color: colors.primary,
  },
  chipSub: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  chipSubSelected: {
    color: '#60A5FA',
  },
})
