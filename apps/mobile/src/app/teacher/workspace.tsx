import { useLocalSearchParams } from 'expo-router'

import { OmrWorkspaceScreen } from '@/features/omr/screens/OmrWorkspaceScreen'

export default function OmrWorkspaceRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  return <OmrWorkspaceScreen sessionId={Number(sessionId)} />
}
