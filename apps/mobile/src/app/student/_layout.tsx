import { Stack } from 'expo-router'

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="take-practice"
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
      <Stack.Screen
        name="take-exam"
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
    </Stack>
  )
}
