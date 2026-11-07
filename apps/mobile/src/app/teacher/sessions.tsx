import { useLocalSearchParams } from 'expo-router'

import { OmrSessionsScreen } from '@/features/omr/screens/OmrSessionsScreen'

export default function OmrSessionsRoute() {
  const { examId } = useLocalSearchParams<{ examId: string }>()
  return <OmrSessionsScreen examId={Number(examId)} />
}
