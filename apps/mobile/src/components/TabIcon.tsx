import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import type { ColorValue } from 'react-native'

type IoniconName = ComponentProps<typeof Ionicons>['name']

/** Dùng cho `tabBarIcon`: `tabBarIcon: tabIcon('home-outline')`. */
export function tabIcon(name: IoniconName) {
  return function TabBarIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />
  }
}
