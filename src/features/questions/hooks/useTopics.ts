import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  createTopic,
  deleteTopic,
  getTopic,
  getTopics,
  updateTopic,
} from '../api/topics.api'
import type { GetTopicsParams } from '../api/topics.api'
import type { TopicPayload, TopicUpdatePayload } from '../types/topic.types'

export const topicKeys = {
  all: ['topics'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (params: GetTopicsParams) => [...topicKeys.lists(), params] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: number) => [...topicKeys.details(), id] as const,
}

export function useTopics(params: GetTopicsParams | undefined) {
  return useQuery({
    queryKey: topicKeys.list(params ?? { subjectId: -1, page: 0, size: 50 }),
    queryFn: () => getTopics(params!),
    enabled: params !== undefined && params.subjectId > 0,
    staleTime: STALE_TIME.list,
  })
}

export function useTopic(id: number | undefined) {
  return useQuery({
    queryKey: topicKeys.detail(id ?? -1),
    queryFn: () => getTopic(id!),
    enabled: id !== undefined && id > 0,
    staleTime: STALE_TIME.detail,
  })
}

export function useCreateTopic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TopicPayload) => createTopic(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.all })
    },
  })
}

export function useUpdateTopic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TopicUpdatePayload }) => updateTopic(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.all })
      void queryClient.invalidateQueries({ queryKey: topicKeys.detail(variables.id) })
    },
  })
}

export function useDeleteTopic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteTopic(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: topicKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })
}
