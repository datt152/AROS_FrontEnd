import { useLocalSearchParams } from 'expo-router'

import { ExamTakeScreen } from '@/features/exam-take/screens/ExamTakeScreen'

export default function TakeExamRoute() {
  const { examId, classroomId } = useLocalSearchParams<{ examId: string; classroomId: string }>()
  return (
    <ExamTakeScreen
      examId={Number(examId)}
      classroomId={Number(classroomId)}
      purpose="EXAM"
    />
  )
}
