'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import { getInsurerWrit } from '@/lib/api'
import { getInsurerToken, removeInsurerToken } from '@/lib/auth'

export default function InsurerWritDetailPage() {
  const { writNumber } = useParams()
  const router = useRouter()
  const [writ, setWrit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function handleLogout() {
    removeInsurerToken()
    router.push('/insurer/login')
  }

  useEffect(() => {
    const token = getInsurerToken()
    if (!token) { router.push('/insurer/login'); return }
    getInsurerWrit(token, writNumber)
      .then((data) => setWrit(data.writ))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [writNumber])

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <p className="text-brand-muted text-sm">Loading writ...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-brand-red text-sm">{error}</p>
        <Link href="/insurer/writs" className="block mt-4 text-sm text-brand-green hover:underline">Back to Writs</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-text">Writ Detail</h2>
          <Link href="/insurer/writs" className="text-sm text-brand-muted hover:underline">Back</Link>
        </div>

        {/* Fraud alert banner */}
        <div className="bg-brand-green rounded-2xl p-4">
          <p className="text-white font-bold text-sm mb-1">SHA-256 Sealed — Tamper Proof</p>
          <p className="text-green-100 text-xs">This writ was automatically captured at the accident scene. All evidence is forensically sealed. Any tampering will invalidate the hash.</p>
        </div>

        {/* Writ + policyholder */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-brand-muted uppercase tracking-wide">Writ Number</p>
              <p className="text-lg font-bold text-brand-text mt-1">{writ.writNumber}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${writ.writStatus === 'SEALED' ? 'bg-green-100 text-brand-green' : 'bg-yellow-100 text-yellow-700'}`}>
              {writ.writStatus}
            </span>
          </div>
          <p className="text-xs text-brand-muted">Vehicle: <span className="text-brand-text font-medium">{writ.vehiclePlate}</span></p>
          {writ.driver && (
            <>
              <p className="text-xs text-brand-muted mt-1">Model: <span className="text-brand-text">{writ.driver.vehicleMakeModel}</span></p>
              <p className="text-xs text-brand-muted mt-1">Policy: <span className="text-brand-text">{writ.driver.policyNumber}</span></p>
              <p className="text-xs text-brand-muted mt-1">Phone: <span className="text-brand-text">{writ.driver.phone}</span></p>
            </>
          )}
          <p className="text-xs text-brand-muted mt-1">Recorded: {new Date(writ.createdAt).toLocaleString('en-MY')}</p>
          {writ.videoSealedAt && (
            <p className="text-xs text-brand-muted mt-1">Sealed: {new Date(writ.videoSealedAt).toLocaleString('en-MY')}</p>
          )}
        </Card>

        {/* Hashes */}
        <Card>
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">SHA-256 Master Hash</p>
          <p className="text-xs font-mono text-brand-text break-all">{writ.logHash}</p>
          {writ.videoHash && (
            <>
              <p className="text-xs text-brand-muted uppercase tracking-wide mt-3 mb-1">Video Hash</p>
              <p className="text-xs font-mono text-brand-text break-all">{writ.videoHash}</p>
            </>
          )}
          {writ.imageHashes && writ.imageHashes.length > 0 && (
            <>
              <p className="text-xs text-brand-muted uppercase tracking-wide mt-3 mb-1">Image Hashes</p>
              {writ.imageHashes.map((hash, i) => (
                <div key={i} className="mt-1">
                  <p className="text-xs text-brand-muted">Photo {i + 1}</p>
                  <p className="text-xs font-mono text-brand-text break-all">{hash}</p>
                </div>
              ))}
            </>
          )}
        </Card>

        {/* Location with map */}
        {writ.latitude && writ.longitude && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Accident Location</p>
            <p className="text-sm text-brand-text mb-3">
              {parseFloat(writ.latitude).toFixed(5)}, {parseFloat(writ.longitude).toFixed(5)}
            </p>
            <iframe
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              allowFullScreen
              src={"https://maps.google.com/maps?q=" + writ.latitude + "," + writ.longitude + "&z=16&output=embed"}
            />
          </Card>
        )}

        {/* Incident details */}
        <Card>
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Incident Details</p>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-brand-muted">Description</p>
              <p className="text-sm text-brand-text mt-0.5">{writ.incidentDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <p className="text-xs text-brand-muted">Road</p>
                <p className="text-sm text-brand-text mt-0.5">{writ.roadCondition}</p>
              </div>
              <div>
                <p className="text-xs text-brand-muted">Weather</p>
                <p className="text-sm text-brand-text mt-0.5">{writ.weatherCondition}</p>
              </div>
              <div>
                <p className="text-xs text-brand-muted">Injury</p>
                <p className="text-sm text-brand-text mt-0.5">{writ.injuryStatus}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Other vehicle */}
        {writ.otherVehiclePlate && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Other Vehicle</p>
            <p className="text-sm font-semibold text-brand-text">{writ.otherVehiclePlate}</p>
            {writ.otherVehicleMakeModel && (
              <p className="text-sm text-brand-muted mt-1">{writ.otherVehicleMakeModel}</p>
            )}
          </Card>
        )}

        {/* Video */}
        {writ.videoUrl && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Video Evidence</p>
            <video controls className="w-full rounded-xl" src={writ.videoUrl} />
          </Card>
        )}

        {/* Photos */}
        {writ.imageUrls && writ.imageUrls.length > 0 && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">
              Photos ({writ.imageUrls.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {writ.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={"Evidence " + (i + 1)}
                  className="w-full rounded-xl object-cover aspect-square"
                />
              ))}
            </div>
          </Card>
        )}

        <div className="pb-8" />
      </div>
    </div>
  )
}