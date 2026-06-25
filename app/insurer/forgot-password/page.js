'use client'
import { useState } from 'react'
import Link from 'next/link'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { insurerForgotPassword } from '@/lib/api'

export default function InsurerForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!email) return setError('Enter your email address.')
    setLoading(true)
    try {
      await insurerForgotPassword({ email })
      setSent(true)
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
          <h1 className="text-2xl font-bold text-brand-text">Reset Password</h1>
          <p className="text-sm text-brand-muted mt-1">We'll email you a reset link</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-brand-text font-medium">Reset link sent</p>
              <p className="text-sm text-brand-muted mt-1">Check your email inbox.</p>
              <Link href="/insurer/login" className="block mt-5 text-sm text-brand-green font-medium hover:underline">
                Back to Login
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                label="Email Address"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@insurer.com"
              />
              {error && (
                <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link href="/insurer/login" className="text-center text-sm text-brand-muted hover:underline">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}