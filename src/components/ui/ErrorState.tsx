import type { ReactNode } from 'react'

type ErrorStateProps = {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorState({ title = 'Đã xảy ra lỗi', message, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
      <p className="text-base font-semibold text-red-700">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-red-600">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
