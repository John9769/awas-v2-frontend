'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/Card'
import { submitWrit } from '@/lib/api'
import { getDriverToken, removeDriverToken } from '@/lib/auth'

export default function DraftPage() {
  const router = useRouter()
  const [draft, setDraft] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('awas_draft')
    if (!raw) { router.push('/record'); return }
    setDraft(JSON.parse(raw))
  }, [])

  function handleLogout() {
    removeDriverToken()
    router.push('/login')
  }

  async function handleConfirmSubmit() {
    setShowConfirm(false)
    setLoading(true)
    setError('')
    try {
      const token = getDriverToken()
      const files = window.__awas_draft_files
      if (!files || !files.video) {
        return setError('Draft expired. Please go back and record again.')
      }

      const formData = new FormData()
      formData.append('video', files.video)
      files.images.forEach((img) => formData.append('images', img))
      if (files.audio) formData.append('audio', files.audio)
      files.otherImages.forEach((img) => formData.append('otherImages', img))
      formData.append('latitude', draft.latitude)
      formData.append('longitude', draft.longitude)
      formData.append('incidentDescription', draft.incidentDescription)
      formData.append('roadCondition', draft.roadCondition)
      formData.append('weatherCondition', draft.weatherCondition)
      formData.append('injuryStatus', draft.injuryStatus)
      formData.append('claimType', draft.claimType)
      if (draft.otherVehiclePlate) formData.append('otherVehiclePlate', draft.otherVehiclePlate.toUpperCase())
      if (draft.otherVehicleMakeModel) formData.append('otherVehicleMakeModel', draft.otherVehicleMakeModel)

      const data = await submitWrit(token, formData)
      sessionStorage.removeItem('awas_draft')
      window.__awas_draft_files = null
      const slug = data.writNumber.replace(/\//g, '-')
      router.push('/writ/' + slug)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!draft) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <p className="text-brand-muted text-sm">Loading draft...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-white border-b border-brand-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-brand-text">AWAS</span>
        </div>
        <Link href="/record" className="text-sm text-brand-muted hover:underline">← Edit</Link>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <p className="text-base font-bold text-brand-text mb-2">Submit Writ to Insurer?</p>
            <p className="text-sm text-brand-muted mb-3">By submitting, you confirm that:</p>
            <ul className="text-sm text-brand-text mb-3 flex flex-col gap-1">
              <li>✓ This is a genuine road accident</li>
              <li>✓ All evidence recorded is accurate and truthful</li>
              <li>✓ Your insurer will be notified immediately</li>
            </ul>
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-brand-red font-semibold">⚠️ Warning: Submitting a false or fabricated writ will result in a RM50 penalty charged at your next policy renewal.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-brand-border text-brand-text text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 rounded-xl bg-brand-green text-white text-sm font-medium"
              >
                I Confirm — Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Draft notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-yellow-700 mb-1">📋 Draft Writ Preview</p>
          <p className="text-xs text-yellow-600">This is a preview only. Nothing has been uploaded or submitted yet. Review carefully before submitting to your insurer.</p>
        </div>

        {/* Writ info */}
        <Card>
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Draft Writ</p>
          <p className="text-sm font-bold text-brand-text">Not yet submitted</p>
          {draft.claimType && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-2 ${draft.claimType === 'OWN_DAMAGE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {draft.claimType === 'OWN_DAMAGE' ? 'Own Damage' : 'Third Party'}
            </span>
          )}
          <p className="text-xs text-brand-muted mt-2">
            Location: {parseFloat(draft.latitude).toFixed(5)}, {parseFloat(draft.longitude).toFixed(5)}
          </p>
        </Card>

        {/* Incident details */}
        <Card>
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Incident Details</p>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-brand-muted">Description</p>
              <p className="text-sm text-brand-text mt-0.5">{draft.incidentDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <p className="text-xs text-brand-muted">Road</p>
                <p className="text-sm text-brand-text mt-0.5">{draft.roadCondition}</p>
              </div>
              <div>
                <p className="text-xs text-brand-muted">Weather</p>
                <p className="text-sm text-brand-text mt-0.5">{draft.weatherCondition}</p>
              </div>
              <div>
                <p className="text-xs text-brand-muted">Injury</p>
                <p className="text-sm text-brand-text mt-0.5">{draft.injuryStatus}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Location map */}
        {draft.latitude && draft.longitude && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Accident Location</p>
            <p className="text-sm text-brand-text mb-3">
              {parseFloat(draft.latitude).toFixed(5)}, {parseFloat(draft.longitude).toFixed(5)}
            </p>
            <iframe
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              allowFullScreen
              src={"https://maps.google.com/maps?q=" + draft.latitude + "," + draft.longitude + "&z=16&output=embed"}
            />
          </Card>
        )}

        {/* Video preview */}
        {draft.videoPreview && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Video Evidence</p>
            <video controls className="w-full rounded-xl" src={draft.videoPreview} />
          </Card>
        )}

        {/* Photos preview */}
        {draft.imagePreviews && draft.imagePreviews.length > 0 && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">
              Photos ({draft.imagePreviews.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {draft.imagePreviews.map((src, i) => (
                <img key={i} src={src} alt={'Photo ' + (i + 1)} className="w-full rounded-xl object-cover aspect-square" />
              ))}
            </div>
          </Card>
        )}

        {/* Other vehicle */}
        {draft.otherVehiclePlate && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Other Vehicle</p>
            <p className="text-sm font-semibold text-brand-text">{draft.otherVehiclePlate}</p>
            {draft.otherVehicleMakeModel && (
              <p className="text-sm text-brand-muted mt-1">{draft.otherVehicleMakeModel}</p>
            )}
            {draft.otherImagePreviews && draft.otherImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {draft.otherImagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={'Other ' + (i + 1)} className="w-full rounded-xl object-cover aspect-square" />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Audio */}
        {draft.hasAudio && (
          <Card>
            <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Audio Recording</p>
            <p className="text-xs text-brand-green">✓ Audio recorded — will be sealed on submit</p>
          </Card>
        )}

        {/* Evidence summary */}
        <Card>
          <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Evidence Summary</p>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-brand-text">✓ Video: {draft.hasVideo ? 'Recorded' : 'None'}</p>
            <p className="text-xs text-brand-text">✓ Photos: {draft.imageCount} file(s)</p>
            <p className="text-xs text-brand-text">✓ Audio: {draft.hasAudio ? 'Recorded' : 'Skipped'}</p>
            <p className="text-xs text-brand-text">✓ Other vehicle photos: {draft.otherImageCount} file(s)</p>
            <p className="text-xs text-brand-text">✓ GPS: Locked</p>
            <p className="text-xs text-brand-muted mt-2">SHA-256 hashes will be computed on submit.</p>
          </div>
        </Card>

        {error && (
          <p className="text-sm text-brand-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-brand-green text-white font-bold text-sm disabled:opacity-50"
        >
          {loading ? 'Submitting to Insurer...' : 'Submit to Insurer'}
        </button>

        <div className="pb-8" />
      </div>
    </div>
  )
}