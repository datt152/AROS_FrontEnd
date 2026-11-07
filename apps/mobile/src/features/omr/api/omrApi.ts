import { getExamClassrooms, getExamVersions, getExams } from '@aros/shared/features/exams/api/exams.api'
import type { ExamItem } from '@aros/shared/features/exams/types/exam.types'
import {
  createExamSession,
  getExamSession,
  getExamSessions,
  getOmrSheet,
  getOmrSheets,
  reviewOmrSheet,
  updateExamSessionStatus,
  uploadOmrSheet,
} from '@aros/shared/features/omr/api/omr.api'
import type { UploadFile } from '@aros/shared/platform/uploadFile'

export type { ExamItem }

/** Đề OMR của giáo viên — giống web: lấy đề EXAM rồi lọc examMode === 'OMR_PAPER' */
export async function getOmrExams(): Promise<ExamItem[]> {
  const result = await getExams({ page: 0, size: 100, purpose: 'EXAM' })
  return result.items.filter((exam) => exam.examMode === 'OMR_PAPER')
}

export {
  createExamSession,
  getExamClassrooms,
  getExamSession,
  getExamSessions,
  getExamVersions,
  getOmrSheet,
  getOmrSheets,
  reviewOmrSheet,
  updateExamSessionStatus,
  uploadOmrSheet,
}

export type { UploadFile }
