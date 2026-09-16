import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  createExamTemplate,
  deleteExamTemplate,
  getExamTemplate,
  getExamTemplates,
  previewExamTemplate,
  updateExamTemplate,
} from '../api/examTemplates.api'
import type { GetExamTemplatesParams } from '../api/examTemplates.api'
import type {
  ExamTemplatePayload,
  ExamTemplatePreviewPayload,
} from '../types/examTemplate.types'

export const examTemplateKeys = {
  all: ['exam-templates'] as const,
  lists: () => [...examTemplateKeys.all, 'list'] as const,
  list: (params: GetExamTemplatesParams) => [...examTemplateKeys.lists(), params] as const,
  details: () => [...examTemplateKeys.all, 'detail'] as const,
  detail: (id: number) => [...examTemplateKeys.details(), id] as const,
}

export function useExamTemplates(
  params: GetExamTemplatesParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: examTemplateKeys.list(params),
    queryFn: () => getExamTemplates(params),
    staleTime: STALE_TIME.list,
    enabled: options?.enabled ?? true,
  })
}

export function useExamTemplate(id: number | undefined) {
  return useQuery({
    queryKey: examTemplateKeys.detail(id ?? -1),
    queryFn: () => getExamTemplate(id!),
    enabled: id !== undefined && id > 0,
    staleTime: STALE_TIME.detail,
  })
}

export function useCreateExamTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ExamTemplatePayload) => createExamTemplate(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examTemplateKeys.all })
    },
  })
}

export function useUpdateExamTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ExamTemplatePayload }) =>
      updateExamTemplate(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examTemplateKeys.all })
      void queryClient.invalidateQueries({ queryKey: examTemplateKeys.detail(variables.id) })
    },
  })
}

export function useDeleteExamTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteExamTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examTemplateKeys.all })
    },
  })
}

export function usePreviewExamTemplate() {
  return useMutation({
    mutationFn: (payload: ExamTemplatePreviewPayload) => previewExamTemplate(payload),
  })
}
