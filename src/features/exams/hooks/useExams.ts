import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  createExam,
  createExamVersions,
  deleteExam,
  getExam,
  getExamClassrooms,
  getExams,
  getExamVersionDetail,
  getExamVersions,
  submitExam,
  takeExam,
  updateExam,
  updateExamClassrooms,
} from '../api/exams.api'
import type { GetExamsParams } from '../api/exams.api'
import type {
  ExamCreatePayload,
  ExamUpdatePayload,
  ExamVersionCreatePayload,
  SubmissionPayload,
} from '../types/exam.types'

export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  list: (params: GetExamsParams) => [...examKeys.lists(), params] as const,
  details: () => [...examKeys.all, 'detail'] as const,
  detail: (id: number) => [...examKeys.details(), id] as const,
  versions: (id: number) => [...examKeys.all, 'versions', id] as const,
  versionDetail: (id: number, code: string) => [...examKeys.all, 'version-detail', id, code] as const,
  classrooms: (id: number) => [...examKeys.all, 'classrooms', id] as const,
  take: (id: number) => [...examKeys.all, 'take', id] as const,
}

export function useExams(params: GetExamsParams) {
  return useQuery({
    queryKey: examKeys.list(params),
    queryFn: () => getExams(params),
    staleTime: STALE_TIME.list,
  })
}

export function useExam(id: number | undefined) {
  return useQuery({
    queryKey: examKeys.detail(id ?? -1),
    queryFn: () => getExam(id!),
    enabled: id !== undefined && id > 0,
    staleTime: STALE_TIME.detail,
  })
}

export function useExamVersions(id: number | undefined) {
  return useQuery({
    queryKey: examKeys.versions(id ?? -1),
    queryFn: () => getExamVersions(id!),
    enabled: id !== undefined && id > 0,
    staleTime: STALE_TIME.detail,
  })
}

export function useExamVersionsMany(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: examKeys.versions(id),
      queryFn: () => getExamVersions(id),
      enabled: id > 0,
      staleTime: STALE_TIME.detail,
    })),
  })
}

export function useExamClassrooms(id: number | undefined) {
  return useQuery({
    queryKey: examKeys.classrooms(id ?? -1),
    queryFn: () => getExamClassrooms(id!),
    enabled: id !== undefined && id > 0,
    staleTime: STALE_TIME.detail,
  })
}

export function useExamVersionDetail(examId: number | undefined, versionCode: string | undefined) {
  return useQuery({
    queryKey: examKeys.versionDetail(examId ?? -1, versionCode ?? ''),
    queryFn: () => getExamVersionDetail(examId!, versionCode!),
    enabled: examId !== undefined && examId > 0 && Boolean(versionCode),
    staleTime: STALE_TIME.detail,
  })
}

export function useTakeExam(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: examKeys.take(id ?? -1),
    queryFn: () => takeExam(id!),
    enabled: enabled && id !== undefined && id > 0,
    retry: false,
    staleTime: STALE_TIME.realtime,
  })
}

export function useCreateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ExamCreatePayload) => createExam(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all })
    },
  })
}

export function useUpdateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ExamUpdatePayload }) => updateExam(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all })
      void queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.id) })
    },
  })
}

export function useDeleteExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteExam(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all })
    },
  })
}

export function useUpdateExamClassrooms() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, classroomIds }: { id: number; classroomIds: number[] }) =>
      updateExamClassrooms(id, classroomIds),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.id) })
      void queryClient.invalidateQueries({ queryKey: examKeys.classrooms(variables.id) })
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() })
    },
  })
}

export function useCreateExamVersions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ExamVersionCreatePayload) => createExamVersions(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.versions(variables.examId) })
      void queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.examId) })
    },
  })
}

export function useSubmitExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmissionPayload) => submitExam(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.take(variables.examId) })
    },
  })
}
