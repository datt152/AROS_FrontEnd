import type { ReactNode } from 'react'

type LegalSection = {
  title: string
  content: ReactNode
}

type LegalPageProps = {
  title: string
  updatedAt: string
  intro: string
  sections: LegalSection[]
}

export function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-wider text-blue-600">AROS</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Cập nhật lần cuối: {updatedAt}</p>
      <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">{intro}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">{section.content}</div>
          </section>
        ))}
      </div>
    </article>
  )
}
