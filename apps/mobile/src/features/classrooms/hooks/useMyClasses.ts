import { useQuery } from '@tanstack/react-query'

import { getMyClasses } from '../api/classroomsApi'

export const classroomKeys = {
  myClasses: ['classrooms', 'my'] as const,
}

export function useMyClasses() {
  return useQuery({
    queryKey: classroomKeys.myClasses,
    queryFn: getMyClasses,
    staleTime: 5 * 60_000,
  })
}
