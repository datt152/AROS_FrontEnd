import type { ExamSessionItem, OmrExamCard, OmrSheetItem } from '../types/omr.types'

export const MOCK_OMR_EXAMS: OmrExamCard[] = [
  {
    id: 101,
    title: 'Cuối kỳ CSDL — OMR',
    subjectName: 'Cơ sở dữ liệu',
    versionCodes: ['001', '002', '003'],
    classroomCount: 2,
    totalQuestions: 40,
    status: 'ONGOING',
  },
  {
    id: 102,
    title: 'OMR Index & khóa',
    subjectName: 'Cấu trúc dữ liệu',
    versionCodes: ['A01'],
    classroomCount: 1,
    totalQuestions: 30,
    status: 'DRAFT',
  },
  {
    id: 103,
    title: 'Giữa kỳ Mạng máy tính — giấy',
    subjectName: 'Mạng máy tính',
    versionCodes: [],
    classroomCount: 0,
    totalQuestions: 25,
    status: 'DRAFT',
  },
]

export const MOCK_OMR_SESSIONS: ExamSessionItem[] = [
  {
    id: 1,
    examId: 101,
    examTitle: 'Cuối kỳ CSDL — OMR',
    name: 'Ca sáng — lớp SE17',
    status: 'OPEN',
    createdAt: '2026-09-10T08:00:00',
    sheetCount: 12,
  },
  {
    id: 2,
    examId: 101,
    examTitle: 'Cuối kỳ CSDL — OMR',
    name: 'Ca chiều — lớp SE18',
    status: 'CLOSED',
    createdAt: '2026-09-09T13:30:00',
    sheetCount: 28,
  },
  {
    id: 3,
    examId: 101,
    examTitle: 'Cuối kỳ CSDL — OMR',
    name: 'Phiên thử nghiệm',
    status: 'GRADED',
    createdAt: '2026-09-01T09:00:00',
    sheetCount: 5,
  },
  {
    id: 4,
    examId: 102,
    examTitle: 'OMR Index & khóa',
    name: 'Phiên chấm chính',
    status: 'OPEN',
    createdAt: '2026-09-11T10:00:00',
    sheetCount: 3,
  },
]

function makeAnswers(needReview: number[]): OmrSheetItem['answers'] {
  return Array.from({ length: 10 }, (_, i) => {
    const q = i + 1
    const needs = needReview.includes(q)
    const chosen = needs ? null : (['A', 'B', 'C', 'D'] as const)[i % 4]
    const correct = (['A', 'B', 'C', 'D'] as const)[i % 4]
    return {
      question: q,
      chosen,
      correctAnswer: correct,
      isCorrect: needs ? null : chosen === correct,
      status: needs ? (i % 2 === 0 ? 'BLANK' : 'LOW_CONFIDENCE') : 'OK',
      bubble: chosen
        ? { choice: chosen, x: 40 + (i % 2) * 80, y: 60 + Math.floor(i / 2) * 36, w: 18, h: 18 }
        : null,
    }
  })
}

export const MOCK_OMR_SHEETS: OmrSheetItem[] = [
  {
    submissionId: 1001,
    examSessionId: 1,
    examId: 101,
    status: 'GRADED',
    studentId: '21520001',
    matchedStudentId: 501,
    studentName: 'Nguyễn Văn A',
    examCode: '001',
    score: 8.5,
    maxScore: 10,
    warpedUrl: null,
    originalImageUrl: null,
    needReview: [],
    answers: makeAnswers([]),
    gradedAt: '2026-09-10T08:15:00',
  },
  {
    submissionId: 1002,
    examSessionId: 1,
    examId: 101,
    status: 'NEEDS_REVIEW',
    studentId: '21520099',
    matchedStudentId: null,
    studentName: null,
    examCode: '002',
    score: null,
    maxScore: 10,
    warpedUrl: null,
    originalImageUrl: null,
    needReview: [3, 7, 9],
    answers: makeAnswers([3, 7, 9]),
    gradedAt: null,
  },
  {
    submissionId: 1003,
    examSessionId: 1,
    examId: 101,
    status: 'NEEDS_REVIEW',
    studentId: null,
    matchedStudentId: null,
    studentName: null,
    examCode: null,
    score: null,
    maxScore: 10,
    warpedUrl: null,
    originalImageUrl: null,
    needReview: [1, 2, 4, 5],
    answers: makeAnswers([1, 2, 4, 5]),
    gradedAt: null,
  },
  {
    submissionId: 1004,
    examSessionId: 1,
    examId: 101,
    status: 'FAILED',
    studentId: null,
    matchedStudentId: null,
    studentName: null,
    examCode: null,
    score: null,
    maxScore: 10,
    warpedUrl: null,
    originalImageUrl: null,
    needReview: [],
    answers: [],
    gradedAt: null,
  },
  {
    submissionId: 1005,
    examSessionId: 1,
    examId: 101,
    status: 'PROCESSING',
    studentId: null,
    matchedStudentId: null,
    studentName: null,
    examCode: null,
    score: null,
    maxScore: 10,
    warpedUrl: null,
    originalImageUrl: null,
    needReview: [],
    answers: [],
    gradedAt: null,
  },
  {
    submissionId: 2001,
    examSessionId: 4,
    examId: 102,
    status: 'GRADED',
    studentId: '21520111',
    matchedStudentId: 512,
    studentName: 'Trần Thị B',
    examCode: 'A01',
    score: 7,
    maxScore: 10,
    warpedUrl: null,
    originalImageUrl: null,
    needReview: [],
    answers: makeAnswers([]),
    gradedAt: '2026-09-11T10:20:00',
  },
]

export function getMockOmrExam(examId: number) {
  return MOCK_OMR_EXAMS.find((item) => item.id === examId)
}

export function getMockSessionsByExam(examId: number) {
  return MOCK_OMR_SESSIONS.filter((item) => item.examId === examId)
}

export function getMockSession(sessionId: number) {
  return MOCK_OMR_SESSIONS.find((item) => item.id === sessionId)
}

export function getMockSheetsBySession(sessionId: number) {
  return MOCK_OMR_SHEETS.filter((item) => item.examSessionId === sessionId)
}

export function getMockSheet(sheetId: number) {
  return MOCK_OMR_SHEETS.find((item) => item.submissionId === sheetId)
}
