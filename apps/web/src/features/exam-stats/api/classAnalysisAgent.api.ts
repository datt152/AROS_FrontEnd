import { apiClient } from '../../../lib/axios'
import type {
  AgentRun,
  AgentRunCreated,
  AgentRunStatus,
  AgentStep,
  ClassInsight,
} from '../types/classAnalysisAgent.types'

type AgentStepDto = {
  id?: number
  stepNo?: number
  thought?: string | null
  toolName?: string | null
  toolArgsJson?: string | null
  toolResultJson?: string | null
  createdAt?: string | null
}

type AgentRunDto = {
  id?: number
  examId?: number
  classroomId?: number
  classroomName?: string | null
  status?: AgentRunStatus
  goal?: string
  finalReport?: string | null
  errorMessage?: string | null
  createdAt?: string | null
  finishedAt?: string | null
  steps?: AgentStepDto[]
}

type AgentRunCreatedDto = {
  runId?: number
  status?: AgentRunStatus
  message?: string
}

type ClassInsightDto = {
  id?: number
  examId?: number
  classroomId?: number
  classroomName?: string | null
  reportJson?: string
  sourceRunId?: number | null
  createdAt?: string | null
}

function unwrapObject<T extends object>(data: unknown): T | null {
  if (!data || typeof data !== 'object') return null
  const record = data as { data?: unknown }
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as T
  }
  return data as T
}

function normalizeStep(dto: AgentStepDto): AgentStep | null {
  if (dto.id === undefined || dto.stepNo === undefined) return null
  return {
    id: dto.id,
    stepNo: dto.stepNo,
    thought: dto.thought ?? null,
    toolName: dto.toolName ?? null,
    toolArgsJson: dto.toolArgsJson ?? null,
    toolResultJson: dto.toolResultJson ?? null,
    createdAt: dto.createdAt ?? null,
  }
}

function normalizeRun(dto: AgentRunDto): AgentRun | null {
  if (dto.id === undefined || dto.examId === undefined || dto.classroomId === undefined || !dto.status) {
    return null
  }
  return {
    id: dto.id,
    examId: dto.examId,
    classroomId: dto.classroomId,
    classroomName: dto.classroomName ?? null,
    status: dto.status,
    goal: dto.goal ?? '',
    finalReport: dto.finalReport ?? null,
    errorMessage: dto.errorMessage ?? null,
    createdAt: dto.createdAt ?? null,
    finishedAt: dto.finishedAt ?? null,
    steps: (dto.steps ?? [])
      .map(normalizeStep)
      .filter((item): item is AgentStep => item !== null)
      .sort((a, b) => a.stepNo - b.stepNo),
  }
}

export async function startClassAnalysisAgent(
  examId: number,
  classroomId: number,
): Promise<AgentRunCreated> {
  const response = await apiClient.post<unknown>(
    `/v1/exams/${examId}/classrooms/${classroomId}/analysis-agent/runs`,
  )
  const dto = unwrapObject<AgentRunCreatedDto>(response.data) ?? {}
  if (dto.runId === undefined || !dto.status) {
    throw new Error('Không tạo được agent run')
  }
  return {
    runId: dto.runId,
    status: dto.status,
    message: dto.message ?? 'Đã tạo agent run',
  }
}

export async function getClassAnalysisAgentRun(
  examId: number,
  classroomId: number,
  runId: number,
): Promise<AgentRun> {
  const response = await apiClient.get<unknown>(
    `/v1/exams/${examId}/classrooms/${classroomId}/analysis-agent/runs/${runId}`,
  )
  const run = normalizeRun(unwrapObject<AgentRunDto>(response.data) ?? {})
  if (!run) throw new Error('Không đọc được agent run')
  return run
}

export async function getLatestClassInsight(
  examId: number,
  classroomId: number,
): Promise<ClassInsight | null> {
  try {
    const response = await apiClient.get<unknown>(
      `/v1/exams/${examId}/classrooms/${classroomId}/insights/latest`,
    )
    const dto = unwrapObject<ClassInsightDto>(response.data) ?? {}
    if (dto.id === undefined || !dto.reportJson) return null
    return {
      id: dto.id,
      examId: dto.examId ?? examId,
      classroomId: dto.classroomId ?? classroomId,
      classroomName: dto.classroomName ?? null,
      reportJson: dto.reportJson,
      sourceRunId: dto.sourceRunId ?? null,
      createdAt: dto.createdAt ?? null,
    }
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status
    if (status === 500 || status === 404) {
      // Backend hiện ném RuntimeException khi chưa có insight
      return null
    }
    throw error
  }
}
