import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { STALE_TIME } from '../../../lib/queryStaleTime'
import {
  createExamSession,
  getExamSession,
  getExamSessions,
  getOmrSheet,
  getOmrSheets,
  reviewOmrSheet,
  updateExamSessionStatus,
  uploadOmrSheet,
} from '../api/omr.api'
import type {
  CreateExamSessionPayload,
  ExamSessionStatus,
  OmrSheetItem,
  OmrSheetReviewPayload,
} from '../types/omr.types'

export const omrKeys = {
  all: ['omr'] as const,
  sessions: (examId: number) => [...omrKeys.all, 'sessions', examId] as const,
  session: (sessionId: number) => [...omrKeys.all, 'session', sessionId] as const,
  sheets: (sessionId: number) => [...omrKeys.all, 'sheets', sessionId] as const,
  sheet: (sheetId: number) => [...omrKeys.all, 'sheet', sheetId] as const,
}

export function useExamSessions(examId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.sessions(examId ?? -1),
    queryFn: () => getExamSessions(examId!),
    enabled: examId !== undefined && examId > 0,
    staleTime: STALE_TIME.list,
  })
}

export function useExamSession(sessionId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.session(sessionId ?? -1),
    queryFn: () => getExamSession(sessionId!),
    enabled: sessionId !== undefined && sessionId > 0,
    staleTime: STALE_TIME.detail,
  })
}

export function useOmrSheets(sessionId: number | undefined, options?: { refetchWhileProcessing?: boolean }) {
  return useQuery({
    queryKey: omrKeys.sheets(sessionId ?? -1),
    queryFn: () => getOmrSheets(sessionId!),
    enabled: sessionId !== undefined && sessionId > 0,
    staleTime: STALE_TIME.realtime,
    refetchInterval: (query) => {
      if (!options?.refetchWhileProcessing) return false
      const sheets = query.state.data
      if (!sheets?.some((sheet) => sheet.status === 'PROCESSING')) return false
      return 3000
    },
  })
}

export function useOmrSheet(sheetId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.sheet(sheetId ?? -1),
    queryFn: () => getOmrSheet(sheetId!),
    enabled: sheetId !== undefined && sheetId > 0,
    staleTime: STALE_TIME.detail,
  })
}

export function useCreateExamSession(examId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamSessionPayload) => createExamSession(payload),
    onSuccess: () => {
      if (examId) void queryClient.invalidateQueries({ queryKey: omrKeys.sessions(examId) })
    },
  })
}

export function useUpdateExamSessionStatus(examId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: ExamSessionStatus }) =>
      updateExamSessionStatus(sessionId, status),
    onSuccess: (session) => {
      if (examId) void queryClient.invalidateQueries({ queryKey: omrKeys.sessions(examId) })
      void queryClient.invalidateQueries({ queryKey: omrKeys.session(session.id) })
    },
  })
}

export function useUploadOmrSheet(sessionId: number | undefined, examId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadOmrSheet(sessionId!, file),
    onSuccess: (sheet) => {
      if (!sessionId) return
      void queryClient.invalidateQueries({ queryKey: omrKeys.sheets(sessionId) })
      void queryClient.invalidateQueries({ queryKey: omrKeys.session(sessionId) })
      const eid = examId ?? sheet.examId
      if (eid) void queryClient.invalidateQueries({ queryKey: omrKeys.sessions(eid) })
    },
  })
}

export function useReviewOmrSheet(sheetId: number | undefined, sessionId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: OmrSheetReviewPayload) => reviewOmrSheet(sheetId!, payload),
    onSuccess: (sheet) => {
      const key = omrKeys.sheet(sheet.submissionId)
      const previous = queryClient.getQueryData<OmrSheetItem>(key)

      // PATCH review thường không trả bubble — giữ bbox cũ theo số câu để overlay không mất.
      const bubbleByQuestion = new Map(
        (previous?.answers ?? [])
          .filter((answer) => answer.bubble)
          .map((answer) => [answer.question, answer.bubble] as const),
      )

      const merged: OmrSheetItem = {
        ...sheet,
        warpedUrl: sheet.warpedUrl ?? previous?.warpedUrl ?? null,
        originalImageUrl: sheet.originalImageUrl ?? previous?.originalImageUrl ?? null,
        answers: sheet.answers.map((answer) => ({
          ...answer,
          bubble: answer.bubble ?? bubbleByQuestion.get(answer.question) ?? null,
        })),
      }

      void queryClient.setQueryData(key, merged)
      const sid = sessionId ?? sheet.examSessionId
      void queryClient.invalidateQueries({ queryKey: omrKeys.sheets(sid) })
    },
  })
}
