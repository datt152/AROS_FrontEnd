import { Tabs } from 'expo-router'

import { tabIcon } from '@/components/TabIcon'
import { colors } from '@/theme/colors'

export default function TeacherLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Chấm OMR', tabBarIcon: tabIcon('scan-outline') }} />
      <Tabs.Screen
        name="account"
        options={{ title: 'Tài khoản', tabBarIcon: tabIcon('person-circle-outline') }}
      />
    </Tabs>
  )
}
