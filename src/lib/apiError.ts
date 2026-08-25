import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | string | undefined
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) return data.message
      if (typeof data.error === 'string' && data.error.trim()) return data.error
    }
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
