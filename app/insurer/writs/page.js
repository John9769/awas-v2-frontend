'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import Input from '@/components/Input'
import { getInsurerWrits } from '@/lib/api'
import { getInsurerToken, removeInsurerToken } from '@/lib/auth'

export default function InsurerWritsPage() {
  const router = useRouter()
  const [writs, setWrits] = useState([])
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function handleLogout() {
    removeInsurerToken()
    router.push('/insurer/login')
  }

  useEffect(() => {
    const token = getInsurerToken()
    if (!token) { router.push('/insurer/login'); return }
    fetchWrits(token)
  }, [])

  async function fetchWrits(token, plate = '', from = '', to = '') {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (plate) params.append('vehiclePlate', plate.toUpperCase())
      if (from) params.append('dateFrom', from)
      if (to) params.append('dateTo', to)
      const res = await getInsurerWrits(token, params.toString() ? `?${params.toString()}` : '')
      setWrits(res.writs || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    const token = getInsurerToken()
    fetchWrits(token, vehiclePlate, dateFrom, dateTo)
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Accident Writs</h2>
            <p className="text-sm text-brand-muted mt-1">{writs.length} records</p>
          </div>
          <Link href="/insurer/dashboard" className="text-sm text-brand-muted hover:underline">← Back</Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2">
          <Input
            id="vehiclePlate"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
            placeholder="Filter by plate number..."
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-3 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-3 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-brand-green text-white rounded-xl text-sm font-medium hover:opacity-90"
            >
              Search
            </button>
          </div>
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
            <p className="text-sm text-brand-muted text-center py-4">No writs found.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {writs.map((writ) => (
              <Link key={writ.writNumber} href={`/insurer/writs/${writ.writNumber}`}>
                <Card className="hover:border-brand-green transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{writ.writNumber}</p>
                      <p className="text-xs text-brand-muted mt-1">{writ.vehiclePlate}</p>
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
  )
}