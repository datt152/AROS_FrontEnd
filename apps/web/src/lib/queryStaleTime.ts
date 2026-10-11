/** Stale times theo loại data — tránh refetch khi đổi trang nếu vẫn còn “tươi”. */
export const STALE_TIME = {
  /** Môn học, lớp học — ít đổi, dùng chung nhiều trang */
  reference: 5 * 60_000,
  /** Danh sách exams / questions */
  list: 60_000,
  /** Detail, versions, classrooms của 1 exam */
  detail: 30_000,
  /** Take exam / dữ liệu cần tươi khi vào làm bài */
  realtime: 0,
  /** Session auth */
  auth: 5 * 60_000,
} as const
