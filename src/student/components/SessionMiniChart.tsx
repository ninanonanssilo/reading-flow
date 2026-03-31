import { useMemo } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { SessionData } from '../../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler)

interface Props {
  sessions: SessionData[]
  height?: number
}

export default function SessionMiniChart({ sessions, height = 60 }: Props) {
  const recent = sessions.slice(-5)

  const data = useMemo(() => ({
    labels: recent.map((_, i) => `${sessions.length - recent.length + i + 1}`),
    datasets: [{
      data: recent.map((s) => s.analysis.cwpm),
      borderColor: 'var(--primary)',
      backgroundColor: 'rgba(43, 127, 255, 0.15)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: 'var(--primary)',
      borderWidth: 2,
    }],
  }), [recent, sessions.length])

  if (recent.length < 2) return null

  return (
    <div style={{ height }}>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
          elements: { line: { borderWidth: 2 } },
        }}
      />
    </div>
  )
}
