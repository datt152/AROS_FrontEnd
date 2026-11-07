import { useLocalSearchParams } from 'expo-router'

import { OmrSheetReviewScreen } from '@/features/omr/screens/OmrSheetReviewScreen'

export default function OmrSheetRoute() {
  const { sheetId } = useLocalSearchParams<{ sheetId: string }>()
  return <OmrSheetReviewScreen sheetId={Number(sheetId)} />
}
