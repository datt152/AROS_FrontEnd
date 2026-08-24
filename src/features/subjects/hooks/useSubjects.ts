import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSubject,
  deleteSubject,
  getSubject,
  getSubjects,
  updateSubject,
} from '../api/subjects.api'
import type { SubjectPayload } from '../types/subject.types'

export const subjectKeys = {
  all: ['subjects'] as const,
  lists: () => [...subjectKeys.all, 'list'] as const,
  list: () => [...subjectKeys.lists()] as const,
  details: () => [...subjectKeys.all, 'detail'] as const,
  detail: (id: number) => [...subjectKeys.details(), id] as const,
}

export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.list(),
    queryFn: getSubjects,
  })
}

export function useSubject(id: number | undefined) {
  return useQuery({
    queryKey: subjectKeys.detail(id ?? -1),
    queryFn: () => getSubject(id!),
    enabled: id !== undefined,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubjectPayload) => createSubject(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.all })
    },
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubjectPayload }) => updateSubject(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.all })
      void queryClient.invalidateQueries({ queryKey: subjectKeys.detail(variables.id) })
    },
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteSubject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.all })
    },
  })
}
