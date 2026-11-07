import { useLocalSearchParams } from 'expo-router'

import { OmrScanScreen } from '@/features/omr/screens/OmrScanScreen'

export default function OmrScanRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  return <OmrScanScreen sessionId={Number(sessionId)} />
}
