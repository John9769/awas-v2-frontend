'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { insurerLogin } from '@/lib/api'
import { saveInsurerToken, saveInsurerUser } from '@/lib/auth'

export default function InsurerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (!email || !password) return setError('Enter your email and password.')
    setLoading(true)
    try {
      const data = await insurerLogin({ email, password })
      saveInsurerToken(data.token)
      saveInsurerUser(data.insurerUser)
      if (data.mustChangePassword) {
        router.push('/insurer/change-password')
      } else {
        router.push('/insurer/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-green rounded-2xl mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-text">AWAS</h1>
          <p className="text-sm text-brand-muted mt-1">Insurer Portal</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text mb-5">Insurer Login</h2>
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@insurer.com"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            {error && (
              <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Link href="/insurer/forgot-password" className="text-sm text-brand-green hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-brand-muted mt-6">
          Are you a driver?{' '}
          <Link href="/login" className="text-brand-green font-medium hover:underline">
            Driver Login
          </Link>
        </p>
      </div>
    </div>
  )
}