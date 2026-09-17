import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Button, Card, Field, Input, Select } from '../components/ui'
import { SCHOOLS, DEPARTMENTS } from '../data/seed'

const MATRIC_RE = /^([A-Za-z]{2,6})\/(\d{2,4})\/(\d{3,6})$/

function guessDeptFromMatric(matric) {
  const m = matric.match(MATRIC_RE)
  if (!m) return null
  const code = m[1].toUpperCase()
  const map = { CSC: 'Computer Science', CEN: 'Computer Engineering', EEE: 'Electrical Engineering', IT: 'Information Technology', SEN: 'Software Engineering' }
  return map[code] || null
}

const LEVEL_OPTIONS = [
  { label: '200 Level', value: 200 },
  { label: '300 Level', value: 300 },
]
const DURATION_OPTIONS = [3, 6]

export default function Onboarding() {
  const { currentUser, saveStudentProfile, getStudentProfile } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({
    fullName: currentUser.name || '',
    school: SCHOOLS[0],
    matricNumber: '',
    department: DEPARTMENTS[0],
    level: LEVEL_OPTIONS[0].value,
    durationMonths: DURATION_OPTIONS[0],
  })
  const [error, setError] = useState('')
  const [deptHint, setDeptHint] = useState(null)

  useEffect(() => {
    async function loadExisting() {
      try {
        const existing = await getStudentProfile()
        if (existing) {
          setForm((f) => ({
            ...f,
            fullName: existing.fullname || f.fullName,
            school: existing.school || f.school,
            matricNumber: existing.matricnumber || f.matricNumber,
            department: existing.department || f.department,
            level: existing.level || f.level,
            durationMonths: existing.durationMonths || f.durationMonths,
          }))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadExisting()
  }, [])

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }))
    if (field === 'matricNumber') {
      setDeptHint(guessDeptFromMatric(val))
    }
  }

  function validate() {
    if (!form.fullName.trim()) return 'Full name is required.'
    if (!form.matricNumber.trim()) return 'Matriculation number is required.'
    return null
  }

  function handleContinue(e) {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)
    setError('')
    setStep('confirm')
  }

  async function handleConfirm() {
    try {
      await saveStudentProfile({
        fullname: form.fullName,
        school: form.school,
        matricnumber: form.matricNumber,
        department: form.department,
        level: Number(form.level),
        durationMonths: Number(form.durationMonths),
        confirmed: true,
      })
      navigate('/match')
    } catch (err) {
      setError(err.message)
      setStep('form')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-ink-500 text-sm">Loading your details…</p>
        </div>
      </div>
    )
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
              <Select value={form.level} onChange={(e) => update('level', Number(e.target.value))}>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="IT duration">
              <Select value={form.durationMonths} onChange={(e) => update('durationMonths', Number(e.target.value))}>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d} months</option>
                ))}
              </Select>
            </Field>

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
                ['Level', `${form.level} Level`],
                ['IT duration', `${form.durationMonths} months`],
              ].map(([label, val]) => (
                <div key={label} className="flex items-start justify-between py-3 gap-4">
                  <dt className="text-sm text-ink-500">{label}</dt>
                  <dd className="text-sm font-medium text-ink-900 text-right">{val}</dd>
                </div>
              ))}
            </dl>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-4">{error}</p>}
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