'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import { getAdminWrits } from '@/lib/api'
import { isAdminLoggedIn } from '@/lib/auth'

export default function AdminWritsPage() {
  const router = useRouter()
  const [writs, setWrits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin'); return }
    getAdminWrits()
      .then((res) => setWrits(res.writs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-white border-b border-brand-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-brand-text">AWAS Admin</span>
        </div>
        <Link href="/admin" className="text-sm text-brand-muted hover:underline">Back</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-brand-text">All Writs</h2>
          <p className="text-sm text-brand-muted mt-1">{writs.length} record(s)</p>
        </div>

        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-brand-muted text-center py-8">Loading...</p>
        ) : writs.length === 0 ? (
          <Card>
            <p className="text-sm text-brand-muted text-center py-4">No writs yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {writs.map((writ) => (
              <Card key={writ.writNumber}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{writ.writNumber}</p>
                    <p className="text-xs text-brand-muted mt-1">{writ.vehiclePlate}</p>
                    {writ.claimType && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${writ.claimType === 'OWN_DAMAGE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {writ.claimType === 'OWN_DAMAGE' ? 'Own Damage' : 'Third Party'}
                      </span>
                    )}
                    <p className="text-xs text-brand-muted mt-1">
                      {writ.submittedAt
                        ? new Date(writ.submittedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date(writ.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {writ.incidentDescription && (
                      <p className="text-xs text-brand-muted mt-1 line-clamp-1">{writ.incidentDescription}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${writ.writStage === 'SUBMITTED' ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-yellow-700'}`}>
                    {writ.writStage}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}