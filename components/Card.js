export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-brand-border p-5 ${className}`}>
      {children}
    </div>
  )
}