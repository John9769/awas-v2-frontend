'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import { uploadCsv, getCsvUploads } from '@/lib/api'
import { getInsurerToken, removeInsurerToken } from '@/lib/auth'

export default function CsvUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleLogout() {
    removeInsurerToken()
    router.push('/insurer/login')
  }

  useEffect(() => {
    const token = getInsurerToken()
    if (!token) { router.push('/insurer/login'); return }
    fetchUploads(token)
  }, [])

  async function fetchUploads(token) {
    try {
      const res = await getCsvUploads(token)
      setUploads(res.uploads || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    setError('')
    setSuccess('')
    if (!file) return setError('Please select a CSV file.')
    setUploading(true)
    try {
      const token = getInsurerToken()
      const formData = new FormData()
      formData.append('csv', file)
      const res = await uploadCsv(token, formData)
      setSuccess(`Upload complete. ${res.successRows} added, ${res.failedRows} failed.`)
      setFile(null)
      fetchUploads(token)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-text">Upload Policyholders</h2>
            <p className="text-sm text-brand-muted mt-1">Upload daily CSV to onboard drivers</p>
          </div>
          <Link href="/insurer/dashboard" className="text-sm text-brand-muted hover:underline">← Back</Link>
        </div>

        {/* Upload card */}
        <Card>
          <p className="text-sm font-semibold text-brand-text mb-3">Select CSV File</p>
          <p className="text-xs text-brand-muted mb-4">
            CSV must contain: vehiclePlate, vehicleMakeModel, vehicleType, mykadLastFour, phone, email, policyNumber, policyExpiry
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-brand-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-green file:text-white file:text-sm file:font-medium mb-4"
          />
          {file && <p className="text-xs text-brand-green mb-4">✓ {file.name}</p>}

          {error && (
            <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-brand-green bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
              ✓ {success}
            </p>
          )}

          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </Card>

        {/* Upload history */}
        <div>
          <p className="text-sm font-semibold text-brand-text mb-3">Upload History</p>
          {loading ? (
            <p className="text-sm text-brand-muted text-center py-4">Loading...</p>
          ) : uploads.length === 0 ? (
            <Card>
              <p className="text-sm text-brand-muted text-center py-4">No uploads yet.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {uploads.map((upload) => (
                <Card key={upload.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{upload.fileName}</p>
                      <p className="text-xs text-brand-muted mt-1">
                        {new Date(upload.uploadedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-green font-medium">{upload.successRows} added</p>
                      {upload.failedRows > 0 && (
                        <p className="text-xs text-brand-red mt-1">{upload.failedRows} failed</p>
                      )}
                      <p className="text-xs text-brand-muted mt-1">{upload.totalRows} total</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}