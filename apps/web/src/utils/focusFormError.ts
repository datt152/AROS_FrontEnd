type FocusFormErrorOptions = {
  /** Ánh xạ key lỗi → id DOM (khi khác tên field) */
  fieldIdMap?: Record<string, string>
  /** Container scroll (vd. drawer overflow-y-auto) — nếu không có thì scroll viewport */
  scrollRoot?: HTMLElement | null
}

function scrollElementIntoContainer(element: HTMLElement, scrollRoot: HTMLElement | null | undefined) {
  if (!scrollRoot) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    return
  }

  const rootRect = scrollRoot.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  const offsetTop =
    elementRect.top - rootRect.top + scrollRoot.scrollTop - scrollRoot.clientHeight / 2 + elementRect.height / 2

  scrollRoot.scrollTo({
    top: Math.max(0, offsetTop),
    behavior: 'smooth',
  })
}

function resolveFieldElement(fieldKey: string, fieldIdMap?: Record<string, string>) {
  const domId = fieldIdMap?.[fieldKey] ?? fieldKey

  return (
    document.querySelector<HTMLElement>(`[data-form-field="${fieldKey}"]`) ??
    document.getElementById(domId) ??
    document.querySelector<HTMLElement>(`[name="${fieldKey}"]`)
  )
}

function focusFieldElement(element: HTMLElement) {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    element.focus({ preventScroll: true })
    return
  }

  const focusable = element.querySelector<HTMLElement>(
    'input:not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"])',
  )
  focusable?.focus({ preventScroll: true })
}

export function focusFirstFormError(
  errors: Record<string, string | string[] | undefined>,
  fieldOrder: readonly string[],
  options?: FocusFormErrorOptions,
) {
  const firstField = fieldOrder.find((field) => {
    const value = errors[field]
    if (Array.isArray(value)) return value.some(Boolean)
    return Boolean(value)
  })
  if (!firstField) return

  // Đợi React render lỗi + layout xong (đặc biệt trong drawer scroll)
  window.setTimeout(() => {
    const element = resolveFieldElement(firstField, options?.fieldIdMap)
    if (!element) return

    scrollElementIntoContainer(element, options?.scrollRoot)
    focusFieldElement(element)
  }, 0)
}
