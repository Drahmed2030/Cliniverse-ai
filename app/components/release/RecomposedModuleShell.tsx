import type { ReactNode } from 'react'

export default function RecomposedModuleShell({
  eyebrow,
  title,
  description,
  children,
  meta,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  meta?: ReactNode
}) {
  return (
    <section className="cv-recomposed-module" data-recomposed-module>
      <header className="cv-recomposed-header">
        <div>
          {eyebrow ? <p className="cv-recomposed-eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p className="cv-recomposed-description">{description}</p> : null}
        </div>
        {meta ? <div className="cv-recomposed-meta">{meta}</div> : null}
      </header>
      <div className="cv-recomposed-body">{children}</div>
    </section>
  )
}
