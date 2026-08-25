import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import { createQuestion, deleteQuestion, getQuestions, updateQuestion } from '../api/questions.api'
import type { GetQuestionsParams } from '../api/questions.api'
import type { QuestionPayload } from '../types/question.types'

export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (params: GetQuestionsParams) => [...questionKeys.lists(), params] as const,
  counts: () => [...questionKeys.all, 'count'] as const,
  count: (subjectId: number) => [...questionKeys.counts(), subjectId] as const,
}

export function useQuestions(params: GetQuestionsParams | undefined) {
  return useQuery({
    queryKey: questionKeys.list(params ?? { subjectId: -1, page: 0, size: 10 }),
    queryFn: () => getQuestions(params!),
    enabled: params !== undefined && params.subjectId > 0,
    staleTime: STALE_TIME.list,
  })
}

export function useQuestionCounts(subjectIds: number[]) {
  return useQueries({
    queries: subjectIds.map((subjectId) => ({
      queryKey: questionKeys.count(subjectId),
      queryFn: async () => {
        const result = await getQuestions({ subjectId, page: 0, size: 1 })
        return result.totalElements
      },
      enabled: subjectId > 0,
      staleTime: STALE_TIME.list,
    })),
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: QuestionPayload) => createQuestion(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questionKeys.all })
    },
  })
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: QuestionPayload }) => updateQuestion(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questionKeys.all })
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questionKeys.all })
    },
  })
}
