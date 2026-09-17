import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  createExam,
  createExamVersions,
  deleteExam,
  getExam,
  getExamClassrooms,
  getExams,
  getExamVersionDetail,
  getExamVersionPdf,
  getExamVersions,
  getMyExams,
  openExamVersionPdf,
  saveExamAsTemplate,
  submitExam,
  takeExam,
  updateExam,
  updateExamClassrooms,
} from '../api/exams.api'
import type { GetExamsParams, GetMyExamsParams } from '../api/exams.api'
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
  mine: () => [...examKeys.all, 'mine'] as const,
  myList: (params: GetMyExamsParams) => [...examKeys.mine(), params] as const,
  details: () => [...examKeys.all, 'detail'] as const,
  detail: (id: number) => [...examKeys.details(), id] as const,
  versions: (id: number) => [...examKeys.all, 'versions', id] as const,
  versionDetail: (id: number, code: string) => [...examKeys.all, 'version-detail', id, code] as const,
  classrooms: (id: number) => [...examKeys.all, 'classrooms', id] as const,
  take: (id: number, classroomId: number) => [...examKeys.all, 'take', id, classroomId] as const,
}

export function useExams(params: GetExamsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: examKeys.list(params),
    queryFn: () => getExams(params),
    staleTime: STALE_TIME.list,
    enabled: options?.enabled ?? true,
  })
}

export function useMyExams(params: GetMyExamsParams | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: examKeys.myList(params ?? { classroomId: -1, purpose: 'EXAM' }),
    queryFn: () => getMyExams(params!),
    staleTime: STALE_TIME.list,
    enabled: (options?.enabled ?? true) && params !== undefined && params.classroomId > 0,
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

export function useTakeExam(id: number | undefined, classroomId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: examKeys.take(id ?? -1, classroomId ?? -1),
    queryFn: () => takeExam(id!, classroomId!),
    enabled: enabled && id !== undefined && id > 0 && classroomId !== undefined && classroomId > 0,
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

export function useSaveExamAsTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => saveExamAsTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exam-templates'] })
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

async function downloadExamVersionPdfOrThrow(
  examId: number,
  versionCode: string,
  fileName?: string,
) {
  try {
    const blob = await getExamVersionPdf(examId, versionCode)
    openExamVersionPdf(blob, fileName ?? `de-${examId}-ma-${versionCode}.pdf`)
    return blob
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      const text = await error.response.data.text()
      try {
        const parsed = JSON.parse(text) as { message?: string; detail?: string; error?: string }
        throw new Error(parsed.message ?? parsed.detail ?? parsed.error ?? 'Không thể tải PDF mã đề')
      } catch (inner) {
        if (
          inner instanceof Error &&
          inner.message !== 'Không thể tải PDF mã đề' &&
          !inner.message.startsWith('Unexpected')
        ) {
          throw inner
        }
        throw new Error(text.trim() || 'Không thể tải PDF mã đề')
      }
    }
    throw error
  }
}

export function useDownloadExamVersionPdf() {
  return useMutation({
    mutationFn: async ({
      examId,
      versionCodes,
      fileNamePrefix,
    }: {
      examId: number
      versionCodes: string[]
      fileNamePrefix?: string
    }) => {
      const codes = versionCodes.map((code) => code.trim()).filter(Boolean)
      if (codes.length === 0) throw new Error('Vui lòng chọn mã đề')

      const prefix = (fileNamePrefix ?? `de-${examId}`).replace(/[\\/:*?"<>|]+/g, '_')
      for (const versionCode of codes) {
        await downloadExamVersionPdfOrThrow(
          examId,
          versionCode,
          `${prefix}-ma-${versionCode}.pdf`,
        )
      }
      return codes
    },
  })
}

export function useSubmitExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmissionPayload) => submitExam(payload),
    onSuccess: () => {
      // Không invalidate take — refetch sẽ 400 “đã nộp” và che màn kết quả.
      void queryClient.invalidateQueries({ queryKey: examKeys.mine() })
    },
  })
}
