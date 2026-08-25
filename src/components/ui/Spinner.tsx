type SpinnerProps = {
  className?: string
  label?: string
}

export function Spinner({ className = '', label = 'Đang tải...' }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
