import React from 'react'

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-ink-100 ${className}`}>{children}</div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-forest-600 hover:bg-forest-700 text-white',
    secondary: 'bg-white hover:bg-ink-50 text-ink-800 border border-ink-200',
    accent: 'bg-clay-500 hover:bg-clay-600 text-white',
    ghost: 'hover:bg-ink-100 text-ink-700',
    danger: 'bg-white hover:bg-red-50 text-red-600 border border-red-200',
  }
  return (
    <button
      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'forest' }) {
  const tones = {
    forest: 'bg-forest-100 text-forest-700',
    clay: 'bg-clay-100 text-clay-700',
    trust: 'bg-trust-100 text-trust-700',
    ink: 'bg-ink-100 text-ink-600',
  }
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400 text-sm"
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400 text-sm bg-white"
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400 text-sm resize-none"
      {...props}
    />
  )
}

export function ProgressBar({ done, total, tone = 'forest' }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const tones = { forest: 'bg-forest-500', clay: 'bg-clay-500', trust: 'bg-trust-500' }
  return (
    <div className="w-full">
      <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
        <div className={`h-full ${tones[tone]} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
