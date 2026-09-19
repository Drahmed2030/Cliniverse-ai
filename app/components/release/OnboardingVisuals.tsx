'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'

/**
 * Presentation-only visual storytelling primitives for the release onboarding
 * narrative. These hold no product state and derive nothing — every value they
 * render is passed in by the caller.
 */

interface FlowItem {
  icon: LucideIcon
  label: string
  detail: string
}

export function FeatureFlow({ items, ariaLabel, large = false }: { items: FlowItem[]; ariaLabel: string; large?: boolean }) {
  const wellSize = large ? 56 : 40
  const iconSize = large ? 24 : 19
  return (
    <div role="list" aria-label={ariaLabel} style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, i) => {
        const Icon = item.icon
        const isLast = i === items.length - 1
        return (
          <div key={item.label} role="listitem" style={{ display: 'flex', gap: large ? 18 : 14, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  width: wellSize,
                  height: wellSize,
                  borderRadius: 'var(--cv-radius-md)',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'color-mix(in srgb, var(--cv-teal) 14%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--cv-teal) 26%, transparent)',
                }}
              >
                <Icon size={iconSize} color="var(--cv-teal)" strokeWidth={2} />
              </div>
              {!isLast && (
                <div aria-hidden="true" style={{ width: 1, flex: 1, minHeight: large ? 22 : 16, background: 'var(--cv-border)', margin: '4px 0' }} />
              )}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : large ? 22 : 16, paddingTop: large ? 6 : 0 }}>
              <div style={{ fontSize: large ? 'var(--cv-text-section)' : 'var(--cv-text-body)', fontWeight: 800, color: 'var(--cv-text)' }}>{item.label}</div>
              <div style={{ fontSize: large ? 'var(--cv-text-body)' : 'var(--cv-text-support)', color: 'var(--cv-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface BeamStage {
  icon: LucideIcon
  label: string
}

export function CapabilityBeam({
  stages,
  ariaLabel,
  large = false,
  orientation = 'horizontal',
}: {
  stages: BeamStage[]
  ariaLabel: string
  large?: boolean
  orientation?: 'horizontal' | 'vertical'
}) {
  const nodeSize = large ? 56 : 44
  const iconSize = large ? 22 : 18
  const vertical = orientation === 'vertical'

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: vertical ? 'flex-start' : 'flex-start',
        justifyContent: vertical ? 'flex-start' : 'space-between',
      }}
    >
      {stages.map((stage, i) => {
        const Icon = stage.icon
        const isLast = i === stages.length - 1
        return (
          <div
            key={stage.label}
            role="listitem"
            style={
              vertical
                ? { display: 'flex', alignItems: 'flex-start', gap: 16, flex: isLast ? '0 0 auto' : undefined }
                : { display: 'flex', alignItems: 'center', flex: isLast ? '0 0 auto' : '1 1 auto' }
            }
          >
            <div
              style={
                vertical
                  ? { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }
                  : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }
              }
            >
              <div
                aria-hidden="true"
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--cv-surface-elevated)',
                  border: '1.5px solid color-mix(in srgb, var(--cv-violet) 40%, var(--cv-border))',
                }}
              >
                <Icon size={iconSize} color="var(--cv-violet)" strokeWidth={2} />
              </div>
              {vertical && !isLast && (
                <div aria-hidden="true" style={{ width: 1, flex: 1, minHeight: 28, background: 'color-mix(in srgb, var(--cv-violet) 30%, var(--cv-border))', margin: '6px 0' }} />
              )}
              {!vertical && (
                <div style={{ fontSize: large ? 'var(--cv-text-support)' : 'var(--cv-text-caption)', fontWeight: 700, color: 'var(--cv-text-secondary)', textAlign: 'center', maxWidth: large ? 96 : 72 }}>
                  {stage.label}
                </div>
              )}
            </div>
            {vertical ? (
              <div style={{ paddingTop: nodeSize / 2 - 10, paddingBottom: isLast ? 0 : 28 }}>
                <div style={{ fontSize: 'var(--cv-text-section)', fontWeight: 800, color: 'var(--cv-text)' }}>{stage.label}</div>
              </div>
            ) : (
              !isLast && (
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 1,
                    minWidth: 10,
                    marginBottom: large ? 34 : 26,
                    background:
                      'linear-gradient(90deg, color-mix(in srgb, var(--cv-violet) 45%, transparent), color-mix(in srgb, var(--cv-violet) 12%, transparent))',
                  }}
                />
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Shared decorative frame for the wide (iPad/desktop) onboarding companion panel. Height-capped so content — not empty space — determines how it reads. */
export function AnchorFrame({ tone = 'teal', children }: { tone?: 'teal' | 'violet'; children: ReactNode }) {
  const accent = tone === 'violet' ? 'var(--cv-violet)' : 'var(--cv-teal)'
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 320,
        maxHeight: 'min(560px, 70dvh)',
        borderRadius: 'var(--cv-radius-xl)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'var(--cv-surface-subtle)',
        border: '1px solid var(--cv-border)',
        padding: 'var(--cv-space-7)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${accent} 16%, transparent), transparent 60%)`,
        }}
      />
      <div style={{ position: 'relative', width: '100%' }}>{children}</div>
    </div>
  )
}

/** Oversized editorial mark treatment — deliberate negative space, not an accidental empty box. */
export function EditorialMark({ icon: Icon, label, tone = 'teal' }: { icon: LucideIcon; label: string; tone?: 'teal' | 'violet' }) {
  const accent = tone === 'violet' ? 'var(--cv-violet)' : 'var(--cv-teal)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24 }}>
      <div
        aria-hidden="true"
        style={{
          width: 116,
          height: 116,
          borderRadius: 32,
          display: 'grid',
          placeItems: 'center',
          background: `color-mix(in srgb, ${accent} 14%, var(--cv-surface-elevated))`,
          border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
        }}
      >
        <Icon size={52} color={accent} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: 'var(--cv-text-eyebrow)', fontWeight: 800, letterSpacing: '0.16em', color: 'var(--cv-text-secondary)' }}>
        {label}
      </div>
    </div>
  )
}

/** Reactive summary reflecting real selection state — not decoration. */
export function SelectionSummary({ options, selected }: { options: readonly string[]; selected: string[] }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--cv-text-eyebrow)', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--cv-text-secondary)', marginBottom: 14 }}>
        {selected.length > 0 ? "YOU'RE SET UP FOR" : 'WAITING FOR YOUR PICKS'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(name => {
          const active = selected.includes(name)
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: active ? 1 : 0.4, transition: 'opacity var(--cv-motion-base) ease' }}>
              <div
                aria-hidden="true"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  background: active ? 'color-mix(in srgb, var(--cv-teal) 20%, transparent)' : 'transparent',
                  border: `1.5px solid ${active ? 'var(--cv-teal)' : 'var(--cv-border)'}`,
                }}
              >
                {active && <Check size={12} strokeWidth={3} color="var(--cv-teal)" />}
              </div>
              <div style={{ fontSize: 'var(--cv-text-section)', fontWeight: 700, color: 'var(--cv-text)' }}>{name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
