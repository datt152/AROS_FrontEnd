import { useQuery } from '@tanstack/react-query'

import { getMyClasses, getMySubmissions, getPracticeExams } from '../api/practiceApi'

export const practiceKeys = {
  classes: ['practice', 'classes'] as const,
  exams: (classroomId: number) => ['practice', 'exams', classroomId] as const,
  submissions: ['practice', 'submissions'] as const,
}

export function useMyClasses() {
  return useQuery({
    queryKey: practiceKeys.classes,
    queryFn: getMyClasses,
    staleTime: 5 * 60_000,
  })
}

export function usePracticeExams(classroomId: number | undefined) {
  return useQuery({
    queryKey: practiceKeys.exams(classroomId ?? -1),
    queryFn: () => getPracticeExams(classroomId!),
    enabled: classroomId !== undefined && classroomId > 0,
    staleTime: 30_000,
  })
}

export function useMySubmissions() {
  return useQuery({
    queryKey: practiceKeys.submissions,
    queryFn: () => getMySubmissions(),
    staleTime: 30_000,
  })
}
