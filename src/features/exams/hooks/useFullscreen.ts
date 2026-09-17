import { useCallback, useEffect, useState, type RefObject } from 'react'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>
}

function getFullscreenElement() {
  const doc = document as FullscreenDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export function useFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sync = useCallback(() => {
    const el = targetRef.current
    const active = getFullscreenElement()
    setIsFullscreen(Boolean(el && active === el))
  }, [targetRef])

  useEffect(() => {
    const onChange = () => sync()
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange as EventListener)
    sync()
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange as EventListener)
    }
  }, [sync])

  const enter = useCallback(async () => {
    const el = targetRef.current as FullscreenElement | null
    if (!el) return
    setError(null)
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
      else setError('Trình duyệt không hỗ trợ toàn màn hình.')
    } catch {
      setError('Không thể bật toàn màn hình. Hãy cho phép và thử lại.')
    }
  }, [targetRef])

  const exit = useCallback(async () => {
    const doc = document as FullscreenDocument
    if (!getFullscreenElement()) return
    try {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen()
    } catch {
      // ignore
    }
  }, [])

  return { isFullscreen, error, enter, exit }
}
