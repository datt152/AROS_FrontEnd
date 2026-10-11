import { apiClient } from '../../../lib/axios'
import type {
  ClassroomCreatePayload,
  ClassroomItem,
  ClassroomStudent,
  ClassroomUpdatePayload,
  CreateStudentAccountsPayload,
  CreateStudentAccountsResult,
  CreateStudentAccountRowResult,
  CreateStudentAccountStatus,
  EnrollStudentPayload,
  StudentImportResult,
  StudentImportRowResult,
} from '../types/classroom.types'

type ClassroomDto = {
  id?: number
  className?: string
  description?: string
  semester?: string
  academicYear?: string
  isActive?: boolean
  subjectId?: number
  subjectName?: string
  subject?: { id?: number; subjectName?: string }
  teacherName?: string
  teacherEmail?: string
}

type ClassroomStudentDto = {
  id?: number
  fullName?: string
  email?: string
  phone?: string
  studentCode?: string
  missingStudentCode?: boolean
  hasAccount?: boolean
}

function normalizeStudent(dto: ClassroomStudentDto): ClassroomStudent | null {
  if (dto.id === undefined || !dto.fullName?.trim() || !dto.email?.trim()) return null

  const studentCode = dto.studentCode?.trim() ?? ''
  const missingStudentCode = dto.missingStudentCode ?? !studentCode

  return {
    id: dto.id,
    fullName: dto.fullName.trim(),
    email: dto.email.trim(),
    phone: dto.phone?.trim() ?? '',
    studentCode,
    missingStudentCode,
    hasAccount: dto.hasAccount ?? false,
  }
}

function normalizeClassroom(dto: ClassroomDto): ClassroomItem | null {
  const subjectId = dto.subjectId ?? dto.subject?.id
  if (dto.id === undefined || !dto.className || subjectId === undefined) return null

  return {
    id: dto.id,
    className: dto.className,
    description: dto.description ?? '',
    semester: dto.semester ?? '',
    academicYear: dto.academicYear ?? '',
    isActive: dto.isActive ?? true,
    subjectId,
    subjectName: dto.subjectName ?? dto.subject?.subjectName ?? '',
    teacherName: dto.teacherName?.trim() || undefined,
    teacherEmail: dto.teacherEmail?.trim() || undefined,
  }
}

export type ClassroomsPageResult = {
  items: ClassroomItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

/** Dropdown / reference lists. */
export const CLASSROOMS_PICKER_SIZE = 100

function unwrapPage(data: unknown): {
  items: ClassroomDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
} {
  if (Array.isArray(data)) {
    return {
      items: data as ClassroomDto[],
      totalElements: data.length,
      totalPages: 1,
      page: 0,
      size: data.length,
    }
  }

  if (data && typeof data === 'object') {
    const record = data as {
      content?: unknown
      data?: unknown
      totalElements?: number
      totalPages?: number
      number?: number
      size?: number
    }

    const items = Array.isArray(record.content)
      ? (record.content as ClassroomDto[])
      : Array.isArray(record.data)
        ? (record.data as ClassroomDto[])
        : []

    const size = record.size ?? items.length
    const totalElements = record.totalElements ?? items.length
    const totalPages = record.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(size, 1)))

    return {
      items,
      totalElements,
      totalPages,
      page: record.number ?? 0,
      size,
    }
  }

  return { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 }
}

function unwrapList(data: unknown): ClassroomStudentDto[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const record = data as { content?: unknown; data?: unknown; students?: unknown }
    if (Array.isArray(record.content)) return record.content as ClassroomStudentDto[]
    if (Array.isArray(record.data)) return record.data as ClassroomStudentDto[]
    if (Array.isArray(record.students)) return record.students as ClassroomStudentDto[]
  }
  return []
}

export type GetClassroomsParams = {
  subjectId?: number
  page?: number
  size?: number
  includeInactive?: boolean
}

export async function getClassrooms(params: GetClassroomsParams = {}): Promise<ClassroomsPageResult> {
  const page = params.page ?? 0
  const size = params.size ?? CLASSROOMS_PICKER_SIZE

  const response = await apiClient.get<unknown>('/v1/classes', {
    params: {
      page,
      size,
      ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
      ...(params.includeInactive ? { includeInactive: true } : {}),
    },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items
    .map(normalizeClassroom)
    .filter((item): item is ClassroomItem => item !== null)

  return {
    items,
    totalElements: pageData.totalElements,
    totalPages: pageData.totalPages,
    page: pageData.page,
    size: pageData.size,
  }
}

export type GetMyClassesParams = {
  page?: number
  size?: number
}

/** Lớp sinh viên đang học — GET /v1/classes/my */
export async function getMyClasses(params: GetMyClassesParams = {}): Promise<ClassroomsPageResult> {
  const page = params.page ?? 0
  const size = params.size ?? CLASSROOMS_PICKER_SIZE

  const response = await apiClient.get<unknown>('/v1/classes/my', {
    params: { page, size },
  })

  const pageData = unwrapPage(response.data)
  const items = pageData.items
    .map(normalizeClassroom)
    .filter((item): item is ClassroomItem => item !== null)

  return {
    items,
    totalElements: pageData.totalElements,
    totalPages: pageData.totalPages,
    page: pageData.page,
    size: pageData.size,
  }
}

export async function getClassroom(id: number) {
  const response = await apiClient.get<ClassroomDto>(`/v1/classes/${id}`)
  const classroom = normalizeClassroom(response.data)
  if (!classroom) throw new Error('Classroom not found')
  return classroom
}

export async function createClassroom(payload: ClassroomCreatePayload) {
  const response = await apiClient.post<ClassroomDto>('/v1/classes', payload)
  const classroom = normalizeClassroom(response.data)
  if (classroom) return classroom

  return {
    id: Date.now(),
    ...payload,
    subjectName: '',
  }
}

export async function updateClassroom(id: number, payload: ClassroomUpdatePayload) {
  const response = await apiClient.put<ClassroomDto>(`/v1/classes/${id}`, payload)
  const classroom = normalizeClassroom(response.data)
  if (classroom) return classroom

  return {
    id,
    subjectId: 0,
    subjectName: '',
    ...payload,
  }
}

export async function deleteClassroom(id: number) {
  await apiClient.delete(`/v1/classes/${id}`)
}

export async function getClassroomStudents(classroomId: number) {
  const response = await apiClient.get<unknown>(`/v1/classes/${classroomId}/students`)
  return unwrapList(response.data)
    .map(normalizeStudent)
    .filter((item): item is ClassroomStudent => item !== null)
}

export async function enrollStudents(classroomId: number, payload: EnrollStudentPayload) {
  await apiClient.post(`/v1/classes/${classroomId}/students/enroll`, payload)
}

export async function removeStudentFromClass(classroomId: number, studentId: number) {
  await apiClient.delete(`/v1/classes/${classroomId}/students/${studentId}`)
}

export async function updateClassroomStudentCode(
  classroomId: number,
  studentId: number,
  payload: { studentCode: string },
) {
  const response = await apiClient.patch<ClassroomStudentDto>(
    `/v1/classes/${classroomId}/students/${studentId}/student-code`,
    payload,
  )
  const student = normalizeStudent(response.data)
  if (student) return student

  return {
    id: studentId,
    fullName: '',
    email: '',
    phone: '',
    studentCode: payload.studentCode.trim(),
    missingStudentCode: !payload.studentCode.trim(),
    hasAccount: false,
  } satisfies ClassroomStudent
}

type StudentImportRowDto = {
  row?: number
  email?: string
  fullName?: string
  studentCode?: string | null
  message?: string
}

type StudentImportResultDto = {
  total?: number
  success?: number
  failed?: number
  skipped?: number
  errors?: StudentImportRowDto[]
  successes?: StudentImportRowDto[]
}

function normalizeImportRow(dto: StudentImportRowDto): StudentImportRowResult {
  return {
    row: dto.row ?? 0,
    email: dto.email?.trim() ?? '',
    fullName: dto.fullName?.trim() ?? '',
    studentCode: dto.studentCode?.trim() || null,
    message: dto.message?.trim() ?? '',
  }
}

function normalizeImportResult(dto: StudentImportResultDto): StudentImportResult {
  return {
    total: dto.total ?? 0,
    success: dto.success ?? 0,
    failed: dto.failed ?? 0,
    skipped: dto.skipped ?? 0,
    errors: (dto.errors ?? []).map(normalizeImportRow),
    successes: (dto.successes ?? []).map(normalizeImportRow),
  }
}

/** POST multipart — part name must be `file` (.xlsx, max 500 data rows). */
export async function importClassroomStudents(classroomId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<StudentImportResultDto>(
    `/v1/classes/${classroomId}/students/import`,
    formData,
    {
      timeout: 60_000,
      transformRequest: [
        (data, headers) => {
          // Drop default application/json so the browser sets multipart boundary.
          if (data instanceof FormData) {
            if (typeof headers.set === 'function') {
              headers.set('Content-Type', false)
            } else {
              delete (headers as Record<string, unknown>)['Content-Type']
            }
          }
          return data
        },
      ],
    },
  )

  return normalizeImportResult(response.data ?? {})
}

type CreateStudentAccountRowDto = {
  studentId?: number
  email?: string
  fullName?: string
  status?: string
  message?: string
}

type CreateStudentAccountsResultDto = {
  total?: number
  created?: number
  skipped?: number
  failed?: number
  mailQueued?: number
  results?: CreateStudentAccountRowDto[]
}

function normalizeAccountStatus(value: string | undefined): CreateStudentAccountStatus {
  const upper = value?.toUpperCase()
  if (upper === 'CREATED' || upper === 'SKIPPED' || upper === 'FAILED') return upper
  return 'FAILED'
}

function normalizeCreateAccountRow(dto: CreateStudentAccountRowDto): CreateStudentAccountRowResult {
  return {
    studentId: dto.studentId ?? 0,
    email: dto.email?.trim() ?? '',
    fullName: dto.fullName?.trim() ?? '',
    status: normalizeAccountStatus(dto.status),
    message: dto.message?.trim() ?? '',
  }
}

function normalizeCreateAccountsResult(dto: CreateStudentAccountsResultDto): CreateStudentAccountsResult {
  return {
    total: dto.total ?? 0,
    created: dto.created ?? 0,
    skipped: dto.skipped ?? 0,
    failed: dto.failed ?? 0,
    mailQueued: dto.mailQueued ?? 0,
    results: (dto.results ?? []).map(normalizeCreateAccountRow),
  }
}

/** POST — body `{}` = all without account; `{ studentIds }` = selected only. */
export async function createClassroomStudentAccounts(
  classroomId: number,
  payload: CreateStudentAccountsPayload = {},
) {
  const body =
    payload.studentIds && payload.studentIds.length > 0 ? { studentIds: payload.studentIds } : {}

  const response = await apiClient.post<CreateStudentAccountsResultDto>(
    `/v1/classes/${classroomId}/students/create-accounts`,
    body,
    { timeout: 60_000 },
  )

  return normalizeCreateAccountsResult(response.data ?? {})
}
