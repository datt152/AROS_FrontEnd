import { apiClient } from '../../../lib/axios'
import type {
  ClassroomItem,
  ClassroomPayload,
  ClassroomStudent,
  EnrollStudentPayload,
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
}

type ClassroomStudentDto = {
  id?: number
  studentCode?: string
  fullName?: string
  email?: string
  studentId?: number
  username?: string
  name?: string
}

function normalizeClassroom(dto: ClassroomDto): ClassroomItem | null {
  if (dto.id === undefined || !dto.className || dto.subjectId === undefined) return null

  return {
    id: dto.id,
    className: dto.className,
    description: dto.description ?? '',
    semester: dto.semester ?? '',
    academicYear: dto.academicYear ?? '',
    isActive: dto.isActive ?? true,
    subjectId: dto.subjectId,
    subjectName: dto.subjectName ?? '',
  }
}

function normalizeStudent(dto: ClassroomStudentDto): ClassroomStudent | null {
  const id = dto.id ?? dto.studentId
  const email = dto.email?.trim()
  if (id === undefined || !email) return null

  return {
    id,
    studentCode: dto.studentCode ?? `SV${String(id).padStart(3, '0')}`,
    fullName: dto.fullName ?? dto.name ?? dto.username ?? email.split('@')[0] ?? 'Student',
    email,
  }
}

function unwrapPage(data: unknown): ClassroomDto[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const record = data as { content?: unknown; data?: unknown }
    if (Array.isArray(record.content)) return record.content as ClassroomDto[]
    if (Array.isArray(record.data)) return record.data as ClassroomDto[]
  }
  return []
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
}

export async function getClassrooms(params: GetClassroomsParams = {}) {
  const response = await apiClient.get<unknown>('/v1/classes', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 100,
      ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
    },
  })

  return unwrapPage(response.data)
    .map(normalizeClassroom)
    .filter((item): item is ClassroomItem => item !== null)
}

export async function getClassroom(id: number) {
  const response = await apiClient.get<ClassroomDto>(`/v1/classes/${id}`)
  const classroom = normalizeClassroom(response.data)
  if (!classroom) throw new Error('Classroom not found')
  return classroom
}

export async function createClassroom(payload: ClassroomPayload) {
  const response = await apiClient.post<ClassroomDto>('/v1/classes', payload)
  const classroom = normalizeClassroom(response.data)
  if (classroom) return classroom

  return {
    id: Date.now(),
    ...payload,
    subjectName: '',
  }
}

export async function updateClassroom(id: number, payload: ClassroomPayload) {
  const response = await apiClient.put<ClassroomDto>(`/v1/classes/${id}`, payload)
  const classroom = normalizeClassroom(response.data)
  if (classroom) return classroom

  return {
    id,
    ...payload,
    subjectName: '',
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
