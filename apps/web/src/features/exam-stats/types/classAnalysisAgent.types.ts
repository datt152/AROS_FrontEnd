export type AgentRunStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED'

export type AgentStep = {
  id: number
  stepNo: number
  thought: string | null
  toolName: string | null
  toolArgsJson: string | null
  toolResultJson: string | null
  createdAt: string | null
}

export type AgentRun = {
  id: number
  examId: number
  classroomId: number
  classroomName: string | null
  status: AgentRunStatus
  goal: string
  finalReport: string | null
  errorMessage: string | null
  createdAt: string | null
  finishedAt: string | null
  steps: AgentStep[]
}

export type AgentRunCreated = {
  runId: number
  status: AgentRunStatus
  message: string
}

export type ClassInsight = {
  id: number
  examId: number
  classroomId: number
  classroomName: string | null
  reportJson: string
  sourceRunId: number | null
  createdAt: string | null
}

export type AgentInsightReport = {
  summary: string
  weaknesses: Array<{
    order?: number
    correctRate?: number | null
    note?: string
  }>
  suggestions: string[]
}

export function parseInsightReport(reportJson: string | null | undefined): AgentInsightReport | null {
  if (!reportJson) return null
  try {
    const raw = JSON.parse(reportJson) as {
      summary?: unknown
      weaknesses?: unknown
      suggestions?: unknown
    }
    const weaknesses = Array.isArray(raw.weaknesses)
      ? raw.weaknesses.map((item) => {
          const row = item as { order?: unknown; correctRate?: unknown; note?: unknown }
          return {
            order: typeof row.order === 'number' ? row.order : undefined,
            correctRate: typeof row.correctRate === 'number' ? row.correctRate : null,
            note: typeof row.note === 'string' ? row.note : undefined,
          }
        })
      : []
    const suggestions = Array.isArray(raw.suggestions)
      ? raw.suggestions.filter((item): item is string => typeof item === 'string')
      : []
    return {
      summary: typeof raw.summary === 'string' ? raw.summary : '',
      weaknesses,
      suggestions,
    }
  } catch {
    return null
  }
}

export function toolLabel(toolName: string | null | undefined) {
  switch (toolName) {
    case 'get_class_exam_stats':
      return 'Lấy thống kê lớp'
    case 'get_weak_questions':
      return 'Phân tích câu yếu'
    case 'save_class_insight':
      return 'Lưu nhận xét'
    default:
      return toolName || 'Bước xử lý'
  }
}
