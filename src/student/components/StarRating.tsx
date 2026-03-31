import { useState } from 'react'

export default function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`text-5xl transition hover:scale-125 ${filled ? 'drop-shadow-md' : 'opacity-25'}`}
          >
            {filled ? '⭐' : '☆'}
          </button>
        )
      })}
    </div>
  )
}
