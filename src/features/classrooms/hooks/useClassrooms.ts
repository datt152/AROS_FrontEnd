import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  CLASSROOMS_PICKER_SIZE,
  createClassroom,
  createClassroomStudentAccounts,
  deleteClassroom,
  enrollStudents,
  getClassroom,
  getClassrooms,
  getClassroomStudents,
  getMyClasses,
  importClassroomStudents,
  removeStudentFromClass,
  updateClassroom,
  updateClassroomStudentCode,
  type GetClassroomsParams,
  type GetMyClassesParams,
} from '../api/classrooms.api'
import type {
  ClassroomCreatePayload,
  ClassroomUpdatePayload,
  CreateStudentAccountsPayload,
  EnrollStudentPayload,
} from '../types/classroom.types'

export const classroomKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomKeys.all, 'list'] as const,
  list: (params?: GetClassroomsParams) => [...classroomKeys.lists(), params ?? {}] as const,
  mine: (params?: GetMyClassesParams) => [...classroomKeys.all, 'mine', params ?? {}] as const,
  details: () => [...classroomKeys.all, 'detail'] as const,
  detail: (id: number) => [...classroomKeys.details(), id] as const,
  students: (classroomId: number) => [...classroomKeys.all, 'students', classroomId] as const,
}

export function useClassrooms(
  subjectId?: number,
  options?: { enabled?: boolean; includeInactive?: boolean; page?: number; size?: number },
) {
  const params: GetClassroomsParams = {
    subjectId,
    includeInactive: options?.includeInactive ?? false,
    page: options?.page ?? 0,
    size: options?.size ?? CLASSROOMS_PICKER_SIZE,
  }

  return useQuery({
    queryKey: classroomKeys.list(params),
    queryFn: () => getClassrooms(params),
    staleTime: STALE_TIME.reference,
    enabled: options?.enabled ?? true,
  })
}

export function useMyClasses(params?: GetMyClassesParams, options?: { enabled?: boolean }) {
  const queryParams: GetMyClassesParams = {
    page: params?.page ?? 0,
    size: params?.size ?? CLASSROOMS_PICKER_SIZE,
  }

  return useQuery({
    queryKey: classroomKeys.mine(queryParams),
    queryFn: () => getMyClasses(queryParams),
    staleTime: STALE_TIME.reference,
    enabled: options?.enabled ?? true,
  })
}

export function useClassroom(id: number | undefined) {
  return useQuery({
    queryKey: classroomKeys.detail(id ?? -1),
    queryFn: () => getClassroom(id!),
    enabled: id !== undefined,
    staleTime: STALE_TIME.detail,
  })
}

export function useClassroomStudents(classroomId: number | undefined) {
  return useQuery({
    queryKey: classroomKeys.students(classroomId ?? -1),
    queryFn: () => getClassroomStudents(classroomId!),
    enabled: classroomId !== undefined,
    staleTime: STALE_TIME.detail,
  })
}

export function useCreateClassroom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ClassroomCreatePayload) => createClassroom(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.all })
    },
  })
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClassroomUpdatePayload }) =>
      updateClassroom(id, payload),
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

export function useUpdateClassroomStudentCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classroomId,
      studentId,
      studentCode,
    }: {
      classroomId: number
      studentId: number
      studentCode: string
    }) => updateClassroomStudentCode(classroomId, studentId, { studentCode }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.students(variables.classroomId) })
    },
  })
}

export function useImportClassroomStudents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ classroomId, file }: { classroomId: number; file: File }) =>
      importClassroomStudents(classroomId, file),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.students(variables.classroomId) })
    },
  })
}

export function useCreateClassroomStudentAccounts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classroomId,
      payload,
    }: {
      classroomId: number
      payload?: CreateStudentAccountsPayload
    }) => createClassroomStudentAccounts(classroomId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classroomKeys.students(variables.classroomId) })
    },
  })
}
