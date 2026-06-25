'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import { getDriverProfile, getDriverHistory } from '@/lib/api'
import { getDriverToken, removeDriverToken } from '@/lib/auth'

export default function DriverDashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [writs, setWrits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getDriverToken()
    if (!token) { router.push('/login'); return }
    Promise.all([getDriverProfile(token), getDriverHistory(token)])
      .then(([p, w]) => { setProfile(p); setWrits(w.writs || []) })
      .catch((err) => { setError(err.message) })
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    removeDriverToken()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <p className="text-brand-muted text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {profile && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Your Vehicle</p>
            <p className="text-xl font-bold text-brand-text">{profile.vehiclePlate}</p>
            <p className="text-sm text-brand-muted mt-1">{profile.vehicleMakeModel}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${profile.status === 'ACTIVE' ? 'bg-green-100 text-brand-green' : 'bg-red-100 text-brand-red'}`}>
                {profile.status}
              </span>
              <span className="text-xs text-brand-muted">Policy: {profile.policyNumber}</span>
            </div>
            <p className="text-xs text-brand-muted mt-2">
              Expires: {new Date(profile.policyExpiry).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </Card>
        )}

        <Link href="/record">
          <div className="bg-brand-green rounded-2xl p-5 text-white cursor-pointer hover:opacity-95 transition-opacity">
            <p className="text-lg font-bold">Record Accident</p>
            <p className="text-sm text-green-100 mt-1">Capture evidence now — video, photos, location</p>
            <div className="mt-4 inline-block bg-white text-brand-green text-sm font-semibold px-4 py-2 rounded-xl">
              Start Recording →
            </div>
          </div>
        </Link>

        <div>
          <p className="text-sm font-semibold text-brand-text mb-3">Your Writs ({writs.length})</p>
          {writs.length === 0 ? (
            <Card>
              <p className="text-sm text-brand-muted text-center py-4">No accident records yet.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {writs.map((writ) => (
                <Link key={writ.writNumber} href={`/writ/${writ.writNumber}`}>
                  <Card className="hover:border-brand-green transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-brand-text">{writ.writNumber}</p>
                        <p className="text-xs text-brand-muted mt-1">
                          {new Date(writ.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {writ.incidentDescription && (
                          <p className="text-xs text-brand-muted mt-1 line-clamp-1">{writ.incidentDescription}</p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${writ.writStatus === 'SEALED' ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-yellow-700'}`}>
                        {writ.writStatus}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}