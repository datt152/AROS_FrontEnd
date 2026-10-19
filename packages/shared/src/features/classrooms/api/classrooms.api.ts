import { apiClient } from '../../../api/apiClient'
import type { ClassroomItem } from '../types/classroom.types'

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

export type ClassroomsPageResult = {
  items: ClassroomItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export const CLASSROOMS_PICKER_SIZE = 100

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
