import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Button, Card, Field, Input, Select } from '../components/ui'
import { SCHOOLS, DEPARTMENTS, LEVELS } from '../data/seed'

const MATRIC_RE = /^([A-Za-z]{2,6})\/(\d{2,4})\/(\d{3,6})$/ // e.g. CSC/2021/045 style, assist-only

function guessDeptFromMatric(matric) {
  const m = matric.match(MATRIC_RE)
  if (!m) return null
  const code = m[1].toUpperCase()
  const map = { CSC: 'Computer Science', CEN: 'Computer Engineering', EEE: 'Electrical Engineering', IT: 'Information Technology', SEN: 'Software Engineering' }
  return map[code] || null
}

export default function Onboarding() {
  const { currentUser, saveStudentProfile, getStudentProfile, state } = useApp()
  const navigate = useNavigate()
  const existing = getStudentProfile(currentUser.id) || {}
  const [step, setStep] = useState('form') // form | confirm
  const [form, setForm] = useState({
    fullName: existing.fullName || currentUser.name || '',
    school: existing.school || SCHOOLS[0],
    matricNumber: existing.matricNumber || '',
    department: existing.department || DEPARTMENTS[0],
    level: existing.level || LEVELS[1],
    orgName: existing.orgName || '',
    companyId: existing.companyId || '',
    staffName: existing.staffName || '',
    staffPhone: existing.staffPhone || '',
  })
  const [error, setError] = useState('')
  const [deptHint, setDeptHint] = useState(null)

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }))
    if (field === 'matricNumber') {
      setDeptHint(guessDeptFromMatric(val))
    }
  }

  function validate() {
    if (!form.fullName.trim()) return 'Full name is required.'
    if (!form.matricNumber.trim()) return 'Matriculation number is required.'
    if (!form.orgName.trim()) return "Your IT placement organisation name is required."
    if (state.companies?.length > 0 && !form.companyId) return "Choose the company where you are doing your IT."
    if (!form.staffName.trim() || !form.staffPhone.trim()) return "Staff contact name and phone are required."
    if (!/^[0-9+\s-]{7,15}$/.test(form.staffPhone.trim())) return 'Enter a valid staff phone number.'
    return null
  }

  function handleContinue(e) {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)
    setError('')
    setStep('confirm')
  }

  function handleConfirm() {
    saveStudentProfile(currentUser.id, { ...form, confirmed: true })
    navigate('/match')
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            {step === 'form' ? 'Set up your profile' : 'Review your details'}
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            {step === 'form'
              ? 'This information helps us match you with the right SIWES supervisor.'
              : "Make sure everything looks right before we find your supervisor."}
          </p>
        </div>

        {step === 'form' ? (
          <Card className="p-6 space-y-4">
            <Field label="Full name">
              <Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            </Field>
            <Field label="School">
              <Select value={form.school} onChange={(e) => update('school', e.target.value)}>
                {SCHOOLS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Matriculation number">
              <Input
                value={form.matricNumber}
                onChange={(e) => update('matricNumber', e.target.value)}
                placeholder="e.g. CSC/2021/045"
              />
              {deptHint && (
                <p className="text-xs text-forest-600 mt-1.5">
                  Looks like <strong>{deptHint}</strong> — confirm below.
                </p>
              )}
            </Field>
            <Field label="Department">
              <Select value={form.department} onChange={(e) => update('department', e.target.value)}>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </Field>
            <Field label="Level / Year">
              <Select value={form.level} onChange={(e) => update('level', e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>

            <div className="pt-2 border-t border-ink-100">
              <p className="text-sm font-semibold text-ink-800 mb-3">IT placement details</p>
              <div className="space-y-4">
                <Field label="IT organisation">
                  {state.companies?.length > 0 ? (
                    <>
                      <Select
                        value={form.companyId}
                        onChange={(e) => {
                          const company = state.companies.find((c) => c.id === e.target.value)
                          setForm((f) => ({
                            ...f,
                            companyId: e.target.value,
                            orgName: company?.name || '',
                          }))
                        }}
                      >
                        <option value="">Select your IT company</option>
                        {state.companies.map((company) => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </Select>
                      <p className="text-xs text-ink-400 mt-1.5">
                        Choose the registered company where you are doing your IT.
                      </p>
                    </>
                  ) : (
                    <Input value={form.orgName} onChange={(e) => update('orgName', e.target.value)} placeholder="e.g. Zenith Bank Plc" />
                  )}
                </Field>
                <Field label="Staff representative name">
                  <Input value={form.staffName} onChange={(e) => update('staffName', e.target.value)} />
                </Field>
                <Field label="Staff representative phone">
                  <Input value={form.staffPhone} onChange={(e) => update('staffPhone', e.target.value)} placeholder="e.g. 08012345678" />
                </Field>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <Button className="w-full justify-center flex" onClick={handleContinue}>
              Continue to review
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <dl className="divide-y divide-ink-100">
              {[
                ['Full name', form.fullName],
                ['School', form.school],
                ['Matric number', form.matricNumber],
                ['Department', form.department],
                ['Level', form.level],
                ['IT organisation', form.orgName],
                ['Staff contact', `${form.staffName} — ${form.staffPhone}`],
              ].map(([label, val]) => (
                <div key={label} className="flex items-start justify-between py-3 gap-4">
                  <dt className="text-sm text-ink-500">{label}</dt>
                  <dd className="text-sm font-medium text-ink-900 text-right">{val}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep('form')} className="flex items-center gap-2">
                <Pencil size={15} /> Edit
              </Button>
              <Button onClick={handleConfirm} className="flex-1 justify-center flex items-center gap-2">
                <CheckCircle2 size={16} /> Confirm & find supervisor
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
