import type {
  CreateExamSessionPayload,
  ExamSessionStatus,
  OmrSheetItem,
  OmrSheetReviewPayload,
} from '@aros/shared/features/omr/types/omr.types'
import type { UploadFile } from '@aros/shared/platform/uploadFile'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createExamSession,
  getExamClassrooms,
  getExamSession,
  getExamSessions,
  getExamVersions,
  getOmrExams,
  getOmrSheet,
  getOmrSheets,
  reviewOmrSheet,
  updateExamSessionStatus,
  uploadOmrSheet,
} from '../api/omrApi'

export const omrKeys = {
  all: ['omr'] as const,
  exams: ['omr', 'exams'] as const,
  examClassrooms: (examId: number) => ['omr', 'exam-classrooms', examId] as const,
  examVersions: (examId: number) => ['omr', 'exam-versions', examId] as const,
  sessions: (examId: number, classroomId?: number | null) =>
    ['omr', 'sessions', examId, classroomId ?? null] as const,
  session: (sessionId: number) => ['omr', 'session', sessionId] as const,
  sheets: (sessionId: number) => ['omr', 'sheets', sessionId] as const,
  sheet: (sheetId: number) => ['omr', 'sheet', sheetId] as const,
}

const validId = (id: number | undefined): id is number =>
  id !== undefined && Number.isFinite(id) && id > 0

export function useOmrExams() {
  return useQuery({
    queryKey: omrKeys.exams,
    queryFn: getOmrExams,
    staleTime: 30_000,
  })
}

export function useOmrExamClassrooms(examId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.examClassrooms(examId ?? -1),
    queryFn: () => getExamClassrooms(examId!),
    enabled: validId(examId),
    staleTime: 5 * 60_000,
  })
}

export function useOmrExamVersions(examId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.examVersions(examId ?? -1),
    queryFn: () => getExamVersions(examId!),
    enabled: validId(examId),
    staleTime: 5 * 60_000,
  })
}

export function useExamSessions(examId: number | undefined, classroomId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.sessions(examId ?? -1, classroomId),
    queryFn: () => getExamSessions(examId!, classroomId),
    enabled: validId(examId) && validId(classroomId),
    staleTime: 15_000,
  })
}

export function useExamSession(sessionId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.session(sessionId ?? -1),
    queryFn: () => getExamSession(sessionId!),
    enabled: validId(sessionId),
    staleTime: 15_000,
  })
}

/** Tự refresh mỗi 3s khi còn phiếu đang xử lý (giống web) */
export function useOmrSheets(sessionId: number | undefined) {
  return useQuery({
    queryKey: omrKeys.sheets(sessionId ?? -1),
    queryFn: () => getOmrSheets(sessionId!),
    enabled: validId(sessionId),
    staleTime: 10_000,
    refetchInterval: (query) => {
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
    enabled: validId(sheetId),
    staleTime: 15_000,
  })
}

export function useCreateExamSession(examId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamSessionPayload) => createExamSession(payload),
    onSuccess: (session) => {
      if (!validId(examId)) return
      void queryClient.invalidateQueries({ queryKey: ['omr', 'sessions', examId] })
      void queryClient.invalidateQueries({
        queryKey: omrKeys.sessions(examId, session.classroomId),
      })
    },
  })
}

export function useUpdateExamSessionStatus(examId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: ExamSessionStatus }) =>
      updateExamSessionStatus(sessionId, status),
    onSuccess: (session) => {
      if (validId(examId)) {
        void queryClient.invalidateQueries({ queryKey: ['omr', 'sessions', examId] })
      }
      void queryClient.invalidateQueries({ queryKey: omrKeys.session(session.id) })
    },
  })
}

export function useUploadOmrSheet(sessionId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      onUploadProgress,
    }: {
      file: UploadFile
      onUploadProgress?: (percent: number) => void
    }) => uploadOmrSheet(sessionId!, file, { onUploadProgress }),
    onSuccess: () => {
      if (!validId(sessionId)) return
      void queryClient.invalidateQueries({ queryKey: omrKeys.sheets(sessionId) })
      void queryClient.invalidateQueries({ queryKey: omrKeys.session(sessionId) })
    },
  })
}

export function useReviewOmrSheet(sheetId: number | undefined, sessionId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: OmrSheetReviewPayload) => reviewOmrSheet(sheetId!, payload),
    onSuccess: (sheet) => {
      // PATCH /review có thể thiếu tọa độ bubble — giữ lại snapshot từ GET trước đó (giống web)
      const key = omrKeys.sheet(sheet.submissionId)
      const previous = queryClient.getQueryData<OmrSheetItem>(key)
      if (previous?.answers?.length && sheet.answers?.length) {
        const bubbleByQuestion = new Map(
          previous.answers
            .filter((answer) => answer.bubble)
            .map((answer) => [answer.question, answer.bubble] as const),
        )
        queryClient.setQueryData(key, {
          ...sheet,
          answers: sheet.answers.map((answer) => ({
            ...answer,
            bubble: answer.bubble ?? bubbleByQuestion.get(answer.question) ?? null,
          })),
        })
      } else {
        queryClient.setQueryData(key, sheet)
      }
      if (validId(sessionId)) {
        void queryClient.invalidateQueries({ queryKey: omrKeys.sheets(sessionId) })
      }
    },
  })
}
