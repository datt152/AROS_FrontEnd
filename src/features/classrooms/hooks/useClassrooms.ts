import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createClassroom,
  deleteClassroom,
  enrollStudents,
  getClassroom,
  getClassrooms,
  getClassroomStudents,
  removeStudentFromClass,
  updateClassroom,
} from '../api/classrooms.api'
import type { ClassroomPayload, EnrollStudentPayload } from '../types/classroom.types'

export const classroomKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomKeys.all, 'list'] as const,
  list: (subjectId?: number) => [...classroomKeys.lists(), { subjectId }] as const,
  details: () => [...classroomKeys.all, 'detail'] as const,
  detail: (id: number) => [...classroomKeys.details(), id] as const,
  students: (classroomId: number) => [...classroomKeys.all, 'students', classroomId] as const,
}

export function useClassrooms(subjectId?: number) {
  return useQuery({
    queryKey: classroomKeys.list(subjectId),
    queryFn: () => getClassrooms({ subjectId }),
  })
}

export function useClassroom(id: number | undefined) {
  return useQuery({
    queryKey: classroomKeys.detail(id ?? -1),
    queryFn: () => getClassroom(id!),
    enabled: id !== undefined,
  })
}

export function useClassroomStudents(classroomId: number | undefined) {
  return useQuery({
    queryKey: classroomKeys.students(classroomId ?? -1),
    queryFn: () => getClassroomStudents(classroomId!),
    enabled: classroomId !== undefined,
  })
}

export function useCreateClassroom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ClassroomPayload) => createClassroom(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.all })
    },
  })
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClassroomPayload }) => updateClassroom(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.all })
      void queryClient.invalidateQueries({ queryKey: classroomKeys.detail(variables.id) })
    },
  })
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteClassroom(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.all })
    },
  })
}

export function useEnrollStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classroomId, payload }: { classroomId: number; payload: EnrollStudentPayload }) =>
      enrollStudents(classroomId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.students(variables.classroomId) })
    },
  })
}

export function useRemoveStudentFromClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classroomId, studentId }: { classroomId: number; studentId: number }) =>
      removeStudentFromClass(classroomId, studentId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.students(variables.classroomId) })
    },
  })
}
