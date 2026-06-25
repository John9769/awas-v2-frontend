export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) {
  const base = 'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-brand-green text-white hover:opacity-90',
    danger: 'bg-brand-red text-white hover:opacity-90',
    outline: 'border border-brand-border text-brand-text bg-white hover:bg-brand-bg',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}