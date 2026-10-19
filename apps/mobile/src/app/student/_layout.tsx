import { Tabs } from 'expo-router'

import { tabIcon } from '@/components/TabIcon'
import { colors } from '@/theme/colors'

export default function StudentLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Tổng quan', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="practice" options={{ title: 'Luyện tập', tabBarIcon: tabIcon('book-outline') }} />
      <Tabs.Screen name="exams" options={{ title: 'Bài thi', tabBarIcon: tabIcon('document-text-outline') }} />
      <Tabs.Screen
        name="account"
        options={{ title: 'Tài khoản', tabBarIcon: tabIcon('person-circle-outline') }}
      />
    </Tabs>
  )
}
