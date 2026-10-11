import { forwardRef, type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-xl border bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
        hasError
          ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
          : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
      } ${className}`}
      {...props}
    />
  )
})
