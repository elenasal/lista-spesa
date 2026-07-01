export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  }

  return (
    <div
      className={`${sizeClasses[size]} border-sky/30 border-t-sky rounded-full animate-spin`}
    />
  )
}
