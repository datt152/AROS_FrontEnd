import { getMyClasses as getMyClassesShared } from '@aros/shared/features/classrooms/api/classrooms.api'

export async function getMyClasses() {
  const result = await getMyClassesShared({ page: 0, size: 100 })
  return result.items
}
