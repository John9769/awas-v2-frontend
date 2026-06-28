'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import { getInsurerUsers, createInsurerUser, toggleInsurerUserStatus } from '@/lib/api'
import { getInsurerToken, removeInsurerToken, getInsurerUser } from '@/lib/auth'

export default function InsurerUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  function handleLogout() {
    removeInsurerToken()
    router.push('/insurer/login')
  }

  useEffect(() => {
    const token = getInsurerToken()
    if (!token) { router.push('/insurer/login'); return }
    fetchUsers(token)
  }, [])

  async function fetchUsers(token) {
    setLoading(true)
    try {
      const res = await getInsurerUsers(token)
      setUsers(res.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setFormError('')
    if (!name || !email || !role) return setFormError('All fields required.')
    setCreating(true)
    try {
      const token = getInsurerToken()
      await createInsurerUser(token, { name, email, role })
      setName('')
      setEmail('')
      setRole('')
      setShowForm(false)
      fetchUsers(token)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleToggle(id) {
    try {
      const token = getInsurerToken()
      await toggleInsurerUserStatus(token, id)
      fetchUsers(token)
    } catch (err) {
      setError(err.message)
    }
  }

  const roleLabel = (r) => {
    if (r === 'HOC') return 'Head of Claims'
    if (r === 'OFFICER') return 'Officer'
    if (r === 'BACKROOM') return 'Backroom'
    if (r === 'ACCOUNTS') return 'Accounts'
    return r
  }

  const roleColor = (r) => {
    if (r === 'HOC') return 'bg-purple-100 text-purple-700'
    if (r === 'OFFICER') return 'bg-blue-100 text-blue-700'
    if (r === 'BACKROOM') return 'bg-yellow-100 text-yellow-700'
    if (r === 'ACCOUNTS') return 'bg-green-100 text-brand-green'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Portal Users</h2>
            <p className="text-sm text-brand-muted mt-1">{users.length} user(s)</p>
          </div>
          <Link href="/insurer/dashboard" className="text-sm text-brand-muted hover:underline">Back</Link>
        </div>

        {/* Create user button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3 rounded-xl bg-brand-green text-white text-sm font-medium hover:opacity-90"
        >
          {showForm ? 'Cancel' : '+ Add New User'}
        </button>

        {/* Create user form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-brand-border p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-brand-text">New User</p>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ahmad bin Ali"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@insurer.com"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="">Select role</option>
                <option value="OFFICER">Officer — View writs, upload CSV</option>
                <option value="BACKROOM">Backroom — Upload CSV only</option>
                <option value="ACCOUNTS">Accounts — View invoices only</option>
              </select>
            </div>

            {formError && (
              <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {formError}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full py-3 rounded-xl bg-brand-green text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-brand-muted text-center py-8">Loading...</p>
        ) : users.length === 0 ? (
          <Card>
            <p className="text-sm text-brand-muted text-center py-4">No users yet. Add your team above.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <Card key={user.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{user.name}</p>
                    <p className="text-xs text-brand-muted mt-1">{user.email}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${roleColor(user.role)}`}>
                      {roleLabel(user.role)}
                    </span>
                    {user.mustChangePassword && (
                      <p className="text-xs text-yellow-600 mt-1">Pending first login</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-brand-green' : 'bg-red-100 text-brand-red'}`}>
                      {user.status}
                    </span>
                    {user.role !== 'HOC' && (
                      <button
                        onClick={() => handleToggle(user.id)}
                        className="text-xs text-brand-muted hover:underline"
                      >
                        {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}