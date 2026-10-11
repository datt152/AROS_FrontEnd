import axios from 'axios'

/** Contract lỗi OMR từ Backend / Engine — ưu tiên error_code, không parse message raw. */
export type OmrApiErrorBody = {
  success?: boolean
  error_code?: string
  errorCode?: string
  /** Legacy — không dùng để branch */
  error?: string
  message?: string
  hint?: string
  details?: Record<string, unknown>
}

export type OmrErrorKind = 'retake' | 'validation' | 'system' | 'unknown'

export type OmrErrorUiCopy = {
  title: string
  description: string
}

export type ResolvedOmrError = {
  code: string
  kind: OmrErrorKind
  title: string
  description: string
  hint?: string
  details?: Record<string, unknown>
  fileName?: string
}

/** i18n UI theo mã — từ OMR Engine UPDATE.md §4.1 (+ vài mã phụ). */
export const OMR_ERROR_UI: Record<string, OmrErrorUiCopy> = {
  OMR_RET_MARKERS_NOT_FOUND: {
    title: 'Không nhận diện được phiếu',
    description: 'Đảm bảo 4 ô vuông đen ở 4 góc phiếu không bị che khuất.',
  },
  OMR_RET_NO_PAPER: {
    title: 'Không thấy tờ giấy',
    description: 'Đặt phiếu phẳng, chụp thẳng, phiếu chiếm phần lớn khung hình.',
  },
  OMR_RET_NO_EDGES: {
    title: 'Ảnh quá mờ / thiếu sáng',
    description: 'Chụp lại với ánh sáng tốt hơn, tránh rung máy.',
  },
  OMR_RET_MARKERS_TOO_CLOSE: {
    title: 'Góc phiếu không hợp lệ',
    description: 'Chụp toàn bộ phiếu, không zoom quá gần.',
  },
  OMR_RET_INVALID_IMAGE: {
    title: 'Ảnh không hợp lệ',
    description: 'Vui lòng chọn lại hoặc chụp lại ảnh phiếu.',
  },
  OMR_RET_REQUIRED: {
    title: 'Cần chụp lại phiếu',
    description: 'Ảnh chưa đủ điều kiện để nhận dạng. Vui lòng chụp lại.',
  },
  OMR_VAL_INVALID_CONTENT_TYPE: {
    title: 'Sai định dạng file',
    description: 'Chỉ chấp nhận JPG hoặc PNG.',
  },
  OMR_VAL_EMPTY_FILE: {
    title: 'File trống',
    description: 'Hãy chọn lại ảnh phiếu.',
  },
  OMR_VAL_DECODE_FAILED: {
    title: 'Không đọc được ảnh',
    description: 'Kiểm tra định dạng file, tránh file bị hỏng.',
  },
  OMR_VAL_INVALID_PARAM: {
    title: 'Tham số không hợp lệ',
    description: 'Vui lòng thử lại hoặc tải lại trang.',
  },
  OMR_SYS_ENCODE_FAILED: {
    title: 'Lỗi xử lý ảnh',
    description: 'Thử lại. Nếu vẫn lỗi, liên hệ hỗ trợ.',
  },
  OMR_SYS_UPLOAD_FAILED: {
    title: 'Lỗi lưu ảnh',
    description: 'Thử lại sau ít phút.',
  },
  OMR_SYS_INTERNAL: {
    title: 'Lỗi hệ thống',
    description: 'Thử lại. Nếu vẫn lỗi, liên hệ hỗ trợ.',
  },
}

export function getOmrErrorKind(code: string): OmrErrorKind {
  if (code.startsWith('OMR_RET_')) return 'retake'
  if (code.startsWith('OMR_VAL_')) return 'validation'
  if (code.startsWith('OMR_SYS_')) return 'system'
  return 'unknown'
}

function readErrorCode(body: OmrApiErrorBody | null | undefined): string | null {
  if (!body || typeof body !== 'object') return null
  const code = body.error_code ?? body.errorCode
  if (typeof code === 'string' && code.trim()) return code.trim()
  return null
}

function extractOmrErrorBody(error: unknown): OmrApiErrorBody | null {
  if (!axios.isAxiosError(error)) return null
  const data = error.response?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  return data as OmrApiErrorBody
}

function formatMarkersDetail(details: Record<string, unknown> | undefined): string | null {
  if (!details) return null
  const found = details.found
  const expected = details.expected
  if (typeof found === 'number' && typeof expected === 'number') {
    return `Chỉ thấy ${found}/${expected} góc.`
  }
  if (typeof found === 'number') {
    return `Chỉ thấy ${found}/4 góc.`
  }
  return null
}

/**
 * Resolve copy hiển thị từ error_code (+ hint/message fallback).
 * Không branch theo chuỗi message OMR raw.
 */
export function resolveOmrError(
  body: OmrApiErrorBody | null | undefined,
  options?: { fileName?: string; fallbackCode?: string },
): ResolvedOmrError {
  const code = readErrorCode(body) ?? options?.fallbackCode ?? 'OMR_SYS_INTERNAL'
  const kind = getOmrErrorKind(code)
  const mapped = OMR_ERROR_UI[code]
  const hint = typeof body?.hint === 'string' && body.hint.trim() ? body.hint.trim() : undefined
  const message =
    typeof body?.message === 'string' && body.message.trim() ? body.message.trim() : undefined

  let title = mapped?.title ?? 'Không tải được phiếu'
  let description = mapped?.description ?? hint ?? message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.'

  if (!mapped && hint) {
    description = hint
  } else if (!mapped && message) {
    description = message
  }

  if (code === 'OMR_RET_MARKERS_NOT_FOUND') {
    const markersNote = formatMarkersDetail(body?.details)
    if (markersNote) {
      description = `${description} ${markersNote}`
    }
  }

  return {
    code,
    kind,
    title,
    description,
    hint,
    details: body?.details,
    fileName: options?.fileName,
  }
}

export function parseOmrApiError(error: unknown, fileName?: string): ResolvedOmrError {
  const body = extractOmrErrorBody(error)
  if (body && readErrorCode(body)) {
    return resolveOmrError(body, { fileName })
  }

  // Không có error_code — fallback message axios / Error
  let fallbackMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.'
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | string | undefined
    if (typeof data === 'string' && data.trim()) fallbackMessage = data.trim()
    else if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) fallbackMessage = data.message.trim()
      else if (typeof data.error === 'string' && data.error.trim()) fallbackMessage = data.error.trim()
    } else if (error.message) {
      fallbackMessage = error.message
    }
  } else if (error instanceof Error && error.message) {
    fallbackMessage = error.message
  }

  return {
    code: 'OMR_UNKNOWN',
    kind: 'unknown',
    title: 'Không tải được phiếu',
    description: fallbackMessage,
    fileName,
  }
}

export function formatOmrErrorLine(error: ResolvedOmrError): string {
  const prefix = error.fileName ? `${error.fileName}: ` : ''
  return `${prefix}${error.title} — ${error.description}`
}
