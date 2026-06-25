'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import { getAdminDrivers, getInsurers } from '@/lib/api'
import { isAdminLoggedIn } from '@/lib/auth'

export default function AdminDriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [insurers, setInsurers] = useState([])
  const [insurerId, setInsurerId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin'); return }
    Promise.all([getAdminDrivers(), getInsurers()])
      .then(([d, i]) => {
        setDrivers(d.drivers || [])
        setInsurers(i.insurers || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleFilter(id) {
    setInsurerId(id)
    setLoading(true)
    try {
      const res = await getAdminDrivers(id)
      setDrivers(res.drivers || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-white border-b border-brand-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-brand-text">AWAS Admin</span>
        </div>
        <Link href="/admin" className="text-sm text-brand-muted hover:underline">← Back</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Drivers</h2>
            <p className="text-sm text-brand-muted mt-1">{drivers.length} record(s)</p>
          </div>
        </div>

        {/* Filter by insurer */}
        <select
          value={insurerId}
          onChange={(e) => handleFilter(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="">All Insurers</option>
          {insurers.map((ins) => (
            <option key={ins.id} value={ins.id}>{ins.name}</option>
          ))}
        </select>

        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-brand-muted text-center py-8">Loading...</p>
        ) : drivers.length === 0 ? (
          <Card>
            <p className="text-sm text-brand-muted text-center py-4">No drivers found.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {drivers.map((driver) => (
              <Card key={driver.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{driver.vehiclePlate}</p>
                    <p className="text-xs text-brand-muted mt-1">{driver.vehicleMakeModel}</p>
                    <p className="text-xs text-brand-muted mt-1">Policy: {driver.policyNumber}</p>
                    <p className="text-xs text-brand-muted mt-1">
                      Expires: {new Date(driver.policyExpiry).toLocaleDateString('en-MY')}
                    </p>
                    <p className="text-xs text-brand-muted mt-1">{driver.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${driver.status === 'ACTIVE' ? 'bg-green-100 text-brand-green' : 'bg-red-100 text-brand-red'}`}>
                    {driver.status}
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