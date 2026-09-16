import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string
          error?: string
          title?: string
          errors?: Record<string, string | string[]> | Array<{ defaultMessage?: string; field?: string; message?: string }>
        }
      | string
      | undefined

    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) return data.message
      if (typeof data.error === 'string' && data.error.trim()) return data.error
      const detail = (data as { detail?: string }).detail
      if (typeof detail === 'string' && detail.trim()) return detail
      if (typeof data.title === 'string' && data.title.trim() && data.title !== 'Bad Request') {
        // Một số BE trả message validate trong field `title`
        return data.title
      }
      if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        const first = Object.values(data.errors)[0]
        if (typeof first === 'string' && first.trim()) return first
        if (Array.isArray(first) && typeof first[0] === 'string' && first[0].trim()) return first[0]
      }
      if (Array.isArray(data.errors)) {
        const first = data.errors[0]
        const msg = first?.defaultMessage ?? first?.message
        if (typeof msg === 'string' && msg.trim()) return msg
      }
    }
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
