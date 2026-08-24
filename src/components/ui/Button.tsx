import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-r from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-emerald-700',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
}

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
