export default function LoadingSkeleton({ lines = 4, style }) {
  return (
    <div className="skeleton-container" style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{
            width: i === 0 ? '60%' : i === lines - 1 ? '40%' : `${70 + Math.random() * 30}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ height = 150 }) {
  return (
    <div className="glass-card skeleton-card" style={{ height, padding: '1.5rem' }}>
      <div className="skeleton-line" style={{ width: '40%', height: 12, marginBottom: '1rem' }} />
      <div className="skeleton-line" style={{ width: '100%', height: 8 }} />
      <div className="skeleton-line" style={{ width: '85%', height: 8 }} />
      <div className="skeleton-line" style={{ width: '60%', height: 8 }} />
    </div>
  )
}
