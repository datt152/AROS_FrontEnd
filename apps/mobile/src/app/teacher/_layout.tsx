import { Stack } from 'expo-router'

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sessions" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="workspace" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen
        name="scan"
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
      <Stack.Screen name="sheet" options={{ animation: 'slide_from_right' }} />
    </Stack>
  )
}
