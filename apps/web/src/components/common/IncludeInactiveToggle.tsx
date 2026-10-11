type IncludeInactiveToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function IncludeInactiveToggle({ checked, onChange, disabled = false }: IncludeInactiveToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100 disabled:opacity-60"
      />
      Hiện mục đã ẩn
    </label>
  )
}
