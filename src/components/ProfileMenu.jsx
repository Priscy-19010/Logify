import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, X, GraduationCap, ShieldCheck, Building2, User, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card, Badge, Button } from './ui'

const ROLE_ICON = { student: GraduationCap, supervisor: ShieldCheck, company: Building2 }

export default function ProfileMenu() {
  const { currentUser, getStudentProfile, deleteAccount } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setConfirmingDelete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleOpen() {
    setOpen(true)
    if (currentUser.role === 'student' && !profile) {
      setLoading(true)
      try {
        const p = await getStudentProfile()
        setProfile(p)
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await deleteAccount()
      navigate('/login')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (!currentUser) return null
  const RoleIcon = ROLE_ICON[currentUser.role] || User

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-ink-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-semibold text-sm shrink-0">
          {currentUser.name?.[0]?.toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-ink-800 leading-tight">{currentUser.name}</p>
          <p className="text-xs text-ink-400 capitalize leading-tight">{currentUser.role}</p>
        </div>
        <ChevronDown size={14} className="text-ink-400 hidden sm:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setOpen(false)} />

          <div className="fixed inset-x-0 bottom-0 z-50 sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:bottom-auto sm:mt-2 sm:w-80">
            <Card className="p-5 max-h-[80vh] overflow-y-auto rounded-b-none sm:rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RoleIcon size={16} className="text-forest-600" />
                  <Badge tone="forest">{currentUser.role}</Badge>
                </div>
                <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700 sm:hidden">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4">
                <p className="font-display text-lg font-semibold text-ink-900">{currentUser.name}</p>
                <p className="text-sm text-ink-500">{currentUser.email}</p>
              </div>

              {currentUser.role === 'supervisor' && (currentUser.school || currentUser.department) && (
                <dl className="space-y-2 text-sm border-t border-ink-100 pt-4">
                  <Row label="School" value={currentUser.school} />
                  <Row label="Department" value={currentUser.department} />
                </dl>
              )}

              {currentUser.role === 'student' && (
                <div className="border-t border-ink-100 pt-4">
                  {loading && <p className="text-sm text-ink-400">Loading your profile…</p>}
                  {!loading && !profile && (
                    <p className="text-sm text-ink-400">You haven't completed your profile yet.</p>
                  )}
                  {!loading && profile && (
                    <dl className="space-y-2 text-sm">
                      <Row label="Matric number" value={profile.matricnumber} />
                      <Row label="School" value={profile.school} />
                      <Row label="Department" value={profile.department} />
                      <Row label="Level" value={profile.level ? `${profile.level} Level` : null} />
                      <Row label="IT duration" value={profile.durationMonths ? `${profile.durationMonths} months` : null} />
                      <Row label="IT organisation" value={profile.companyName} />
                      <Row
                        label="Staff contact"
                        value={profile.staffName && profile.staffPhone ? `${profile.staffName} — ${profile.staffPhone}` : null}
                      />
                    </dl>
                  )}
                </div>
              )}

              <div className="border-t border-ink-100 mt-4 pt-4">
                {!confirmingDelete ? (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} /> Delete account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-red-600 leading-relaxed">
                      This permanently deletes your account and all associated data. This can't be undone.
                    </p>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                        Cancel
                      </Button>
                      <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Confirm delete'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-400">{label}</dt>
      <dd className="text-ink-800 font-medium text-right">{value}</dd>
    </div>
  )
}