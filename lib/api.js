const BE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:5000'

async function request(path, options = {}) {
  const url = `${BE_URL}${path}`
  const { headers: optHeaders, ...restOptions } = options
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(optHeaders || {}),
    },
    ...restOptions,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// ── DRIVER AUTH ───────────────────────────────────────────
export const driverLogin = (body) =>
  request('/api/auth/driver/login', { method: 'POST', body: JSON.stringify(body) })

export const driverChangePassword = (token, body) =>
  request('/api/auth/driver/change-password', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })

export const driverForgotPassword = (body) =>
  request('/api/auth/driver/forgot-password', { method: 'POST', body: JSON.stringify(body) })

export const driverResetPassword = (body) =>
  request('/api/auth/driver/reset-password', { method: 'POST', body: JSON.stringify(body) })

// ── INSURER AUTH ──────────────────────────────────────────
export const insurerLogin = (body) =>
  request('/api/auth/insurer/login', { method: 'POST', body: JSON.stringify(body) })

export const insurerChangePassword = (token, body) =>
  request('/api/auth/insurer/change-password', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })

export const insurerForgotPassword = (body) =>
  request('/api/auth/insurer/forgot-password', { method: 'POST', body: JSON.stringify(body) })

export const insurerResetPassword = (body) =>
  request('/api/auth/insurer/reset-password', { method: 'POST', body: JSON.stringify(body) })

// ── DRIVER ───────────────────────────────────────────────
export const getDriverProfile = (token) =>
  request('/api/driver/profile', { headers: authHeaders(token) })

export const getDriverHistory = (token) =>
  request('/api/driver/history', { headers: authHeaders(token) })

// ── LOGS ─────────────────────────────────────────────────
export const submitWrit = (token, formData) =>
  fetch(`${BE_URL}/api/logs/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.message || 'Submit failed')
    return data
  })

export const getMyWrits = (token) =>
  request('/api/logs/my-writs', { headers: authHeaders(token) })

export const getWrit = (writNumber) =>
  request(`/api/logs/writ/${writNumber}`)

// ── INSURER ──────────────────────────────────────────────
export const getInsurerDashboard = (token) =>
  request('/api/insurer/dashboard', { headers: authHeaders(token) })

export const getInsurerDrivers = (token, params = '') =>
  request(`/api/insurer/drivers${params}`, { headers: authHeaders(token) })

export const getInsurerWrits = (token, params = '') =>
  request(`/api/insurer/writs${params}`, { headers: authHeaders(token) })

export const getInsurerWrit = (token, writNumber) =>
  request(`/api/insurer/writs/${writNumber}`, { headers: authHeaders(token) })

export const getInsurerInvoices = (token) =>
  request('/api/insurer/invoices', { headers: authHeaders(token) })

export const uploadCsv = (token, formData) =>
  fetch(`${BE_URL}/api/insurer/csv-upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.message || 'Upload failed')
    return data
  })

export const getCsvUploads = (token) =>
  request('/api/insurer/csv-uploads', { headers: authHeaders(token) })

// ── INSURER USER MANAGEMENT ───────────────────────────────
export const getInsurerUsers = (token) =>
  request('/api/insurer/users', { headers: authHeaders(token) })

export const createInsurerUser = (token, body) =>
  request('/api/insurer/users', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })

export const toggleInsurerUserStatus = (token, id) =>
  request(`/api/insurer/users/${id}/toggle-status`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })

// ── ADMIN ────────────────────────────────────────────────
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'awas_v2_admin'
const adminHeaders = () => ({ 'x-admin-key': ADMIN_KEY, 'Content-Type': 'application/json' })

export const getAdminDashboard = () =>
  request('/api/admin/dashboard', { headers: adminHeaders() })

export const createInsurer = (body) =>
  request('/api/admin/insurers', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(body) })

export const getInsurers = () =>
  request('/api/admin/insurers', { headers: adminHeaders() })

export const toggleInsurerStatus = (id) =>
  request(`/api/admin/insurers/${id}/toggle-status`, { method: 'PATCH', headers: adminHeaders() })

export const createHocUser = (body) =>
  request('/api/admin/insurer-users/hoc', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(body) })

export const getAdminInsurerUsers = (insurerId = '') =>
  request(`/api/admin/insurer-users${insurerId ? `?insurerId=${insurerId}` : ''}`, { headers: adminHeaders() })

export const getAdminDrivers = (insurerId = '') =>
  request(`/api/admin/drivers${insurerId ? `?insurerId=${insurerId}` : ''}`, { headers: adminHeaders() })

export const getAdminWrits = () =>
  request('/api/admin/writs', { headers: adminHeaders() })

export const generateWritInvoice = (body) =>
  request('/api/admin/invoices/generate-writ', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(body) })

export const getAdminInvoices = () =>
  request('/api/admin/invoices', { headers: adminHeaders() })

export const markInvoicePaid = (id) =>
  request(`/api/admin/invoices/${id}/mark-paid`, { method: 'PATCH', headers: adminHeaders() })

export const getAdminCsvUploads = () =>
  request('/api/admin/csv-uploads', { headers: adminHeaders() })