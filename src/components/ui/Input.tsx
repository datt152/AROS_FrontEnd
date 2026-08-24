import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export function Input({ hasError = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`h-10 w-full rounded-xl border bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
        hasError
          ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
          : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
      } ${className}`}
      {...props}
    />
  )
}
