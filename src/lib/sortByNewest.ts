type NewestSortable = {
  id: number
  createdAt?: string | null
}

function createdAtMs(value: string | null | undefined) {
  if (!value) return null
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : null
}

/** Mới tạo lên đầu: createdAt giảm dần, cùng thời điểm / thiếu createdAt thì id giảm dần. */
export function compareNewestFirst(a: NewestSortable, b: NewestSortable) {
  const aMs = createdAtMs(a.createdAt)
  const bMs = createdAtMs(b.createdAt)
  if (aMs !== null && bMs !== null && aMs !== bMs) return bMs - aMs
  return b.id - a.id
}

export function sortByNewest<T extends NewestSortable>(items: readonly T[]): T[] {
  return items.slice().sort(compareNewestFirst)
}
