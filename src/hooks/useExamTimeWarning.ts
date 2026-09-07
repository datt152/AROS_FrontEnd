import { useEffect, useRef, useState } from 'react'

const WARNING_THRESHOLD_SECONDS = 30

/** Shows a one-time warning when exam/practice time drops to ≤30s. */
export function useExamTimeWarning(secondsLeft: number | null, enabled: boolean) {
  const [open, setOpen] = useState(false)
  const shownRef = useRef(false)

  useEffect(() => {
    if (!enabled || secondsLeft === null) return

    if (secondsLeft <= 0) {
      setOpen(false)
      return
    }

    if (secondsLeft <= WARNING_THRESHOLD_SECONDS && !shownRef.current) {
      shownRef.current = true
      setOpen(true)
    }
  }, [enabled, secondsLeft])

  function resetWarning() {
    shownRef.current = false
    setOpen(false)
  }

  return {
    open,
    dismiss: () => setOpen(false),
    resetWarning,
    secondsLeft: secondsLeft ?? 0,
  }
}
