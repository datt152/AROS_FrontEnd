import { Redirect } from 'expo-router'

import { useSessionRole } from '@/features/auth/store/authContext'

export default function Index() {
  const role = useSessionRole()

  if (role === 'teacher') return <Redirect href="/teacher" />
  if (role === 'student') return <Redirect href="/student" />
  return <Redirect href="/login" />
}
