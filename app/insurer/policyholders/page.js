'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import Input from '@/components/Input'
import { getInsurerDrivers } from '@/lib/api'
import { getInsurerToken, removeInsurerToken } from '@/lib/auth'

export default function PolicyholdersPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function handleLogout() {
    removeInsurerToken()
    router.push('/insurer/login')
  }

  useEffect(() => {
    const token = getInsurerToken()
    if (!token) { router.push('/insurer/login'); return }
    fetchDrivers(token)
  }, [])

  async function fetchDrivers(token, s = '', st = '') {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (s) params.append('search', s)
      if (st) params.append('status', st)
      const res = await getInsurerDrivers(token, params.toString() ? `?${params.toString()}` : '')
      setDrivers(res.drivers || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    const token = getInsurerToken()
    fetchDrivers(token, search, status)
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Policyholders</h2>
            <p className="text-sm text-brand-muted mt-1">{drivers.length} records</p>
          </div>
          <Link href="/insurer/dashboard" className="text-sm text-brand-muted hover:underline">← Back</Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate or name..."
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-3 bg-brand-green text-white rounded-xl text-sm font-medium hover:opacity-90"
          >
            Search
          </button>
        </div>

        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-brand-muted text-center py-8">Loading...</p>
        ) : drivers.length === 0 ? (
          <Card>
            <p className="text-sm text-brand-muted text-center py-4">No policyholders found.</p>
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