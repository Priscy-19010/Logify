import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, GraduationCap, ShieldCheck, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Card, Field, Input, Select } from '../components/ui'
import { SCHOOLS, DEPARTMENTS } from '../data/seed'

const ROLE_META = {
  student: { label: 'Student', icon: GraduationCap },
  supervisor: { label: 'Supervisor', icon: ShieldCheck },
  company: { label: 'Company', icon: Building2 },
}

export default function Login() {
  const { login, signup, getStudentProfile } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    school: SCHOOLS[0],
    department: DEPARTMENTS[0],
    companyName: '',
  })
  const [error, setError] = useState('')

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'login') {
      const res = login({ role, email: form.email, password: form.password })
      if (!res.ok) return setError(res.error)
      routeAfterAuth(res.id)
      return
    }

    if (!form.name || !form.email || !form.password) return setError('Please fill in all fields.')
    if (role === 'company' && !form.companyName.trim()) return setError('Company name is required.')
    if (role === 'supervisor' && (!form.school || !form.department)) return setError('School and department are required.')

    const res = signup({ role, ...form })
    if (!res.ok) return setError(res.error)
    routeAfterAuth(res.id)
  }

  function routeAfterAuth(userId) {
    if (role === 'supervisor') navigate('/supervisor')
    else if (role === 'company') navigate('/company')
    else {
      const profile = getStudentProfile(userId)
      navigate(profile?.confirmed ? '/student' : '/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-forest-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-forest-600/20">
            <BookOpenCheck size={26} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Logify</h1>
          <p className="text-ink-500 text-sm mt-1">The digital SIWES logbook</p>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-3 gap-1.5 mb-6 bg-ink-50 p-1 rounded-xl">
            {Object.entries(ROLE_META).map(([key, meta]) => {
              const Icon = meta.icon
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setRole(key); setError('') }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    role === key ? 'bg-white shadow-sm text-forest-700' : 'text-ink-500'
                  }`}
                >
                  <Icon size={15} /> {meta.label}
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Field label={role === 'company' ? 'Representative name' : 'Full name'}>
                <Input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={role === 'company' ? 'Jane Doe' : 'Jane Doe'}
                />
              </Field>
            )}

            {mode === 'signup' && role === 'company' && (
              <Field label="Company / organisation name">
                <Input
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  placeholder="e.g. E-INFOTECH SYSTEM AND TELECOMMUNICATIONS LIMITED"
                />
              </Field>
            )}

            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
            </Field>

            <Field label="Password">
              <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" />
            </Field>

            {mode === 'signup' && role === 'supervisor' && (
              <>
                <Field label="School">
                  <Select value={form.school} onChange={(e) => update('school', e.target.value)}>
                    {SCHOOLS.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Department">
                  <Select value={form.department} onChange={(e) => update('department', e.target.value)}>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </Select>
                </Field>
              </>
            )}

            {role === 'company' && (
              <p className="text-xs text-ink-400 bg-ink-50 rounded-lg px-3 py-2">
                Students must enter the same organisation name in their IT placement details for their records to appear in this company portal.
              </p>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <Button type="submit" className="w-full justify-center flex">
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="text-forest-700 font-medium hover:underline"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </Card>

        {role === 'supervisor' && mode === 'login' && (
          <p className="text-center text-xs text-ink-400 mt-4">
            Demo supervisor: anwosu@rsu.edu.ng / password
          </p>
        )}
        {role === 'company' && mode === 'login' && (
          <p className="text-center text-xs text-ink-400 mt-4">
            Demo company: company@example.com / password
          </p>
        )}
      </div>
    </div>
  )
}
