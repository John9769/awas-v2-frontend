// ── DRIVER ────────────────────────────────────────────────
export const saveDriverToken = (token) => localStorage.setItem('awas_driver_token', token)
export const getDriverToken = () => localStorage.getItem('awas_driver_token')
export const removeDriverToken = () => localStorage.removeItem('awas_driver_token')

// ── INSURER USER ──────────────────────────────────────────
export const saveInsurerToken = (token) => localStorage.setItem('awas_insurer_token', token)
export const getInsurerToken = () => localStorage.getItem('awas_insurer_token')
export const removeInsurerToken = () => {
  localStorage.removeItem('awas_insurer_token')
  localStorage.removeItem('awas_insurer_user')
}

export const saveInsurerUser = (user) => localStorage.setItem('awas_insurer_user', JSON.stringify(user))
export const getInsurerUser = () => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('awas_insurer_user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}
export const getInsurerRole = () => {
  const user = getInsurerUser()
  return user ? user.role : null
}

// ── ADMIN ─────────────────────────────────────────────────
export const isAdminLoggedIn = () => {
  if (typeof window === 'undefined') return false
  return !!sessionStorage.getItem('awas_admin_session')
}
export const saveAdminSession = () => sessionStorage.setItem('awas_admin_session', '1')
export const removeAdminSession = () => sessionStorage.removeItem('awas_admin_session')