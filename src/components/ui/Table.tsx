import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

type TableProps = HTMLAttributes<HTMLTableElement>

export function Table({ className = '', children, ...props }: TableProps) {
  return (
    <table className={`w-full table-fixed border-collapse text-sm ${className}`} {...props}>
      {children}
    </table>
  )
}

export function TableColGroup({ children }: { children: ReactNode }) {
  return <colgroup>{children}</colgroup>
}

type TableColProps = {
  className?: string
  width?: string
}

export function TableCol({ className = '', width }: TableColProps) {
  return <col className={className} style={width ? { width } : undefined} />
}

export function TableHeader({ className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />
}

export function TableBody({ className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`[&>tr:last-child]:border-b-0 ${className}`} {...props} />
}

export function TableRow({ className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`border-b border-slate-100 transition hover:bg-slate-50/70 ${className}`} {...props} />
}

type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'center' | 'right'
}

export function TableHead({ className = '', align = 'left', ...props }: TableHeadProps) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <th
      className={`border-b border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${alignClass} ${className}`}
      {...props}
    />
  )
}

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'center' | 'right'
}

export function TableCell({ className = '', align = 'left', ...props }: TableCellProps) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return <td className={`px-3 py-2.5 align-middle ${alignClass} ${className}`} {...props} />
}
