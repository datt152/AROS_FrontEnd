import '@/platform/setupPlatform'

import { QueryClientProvider } from '@tanstack/react-query'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { AuthProvider } from '@/features/auth/store/AuthProvider'
import { useAuth, useSessionRole } from '@/features/auth/store/authContext'
import { queryClient } from '@/lib/queryClient'

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SplashScreenController />
        <RootNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </QueryClientProvider>
  )
}

function SplashScreenController() {
  const { state } = useAuth()
  if (state.status !== 'restoring') {
    SplashScreen.hide()
  }
  return null
}

function RootNavigator() {
  const role = useSessionRole()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={role === null}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'teacher'}>
        <Stack.Screen name="teacher" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'student'}>
        <Stack.Screen name="student" />
      </Stack.Protected>
    </Stack>
  )
}
