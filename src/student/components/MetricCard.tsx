export default function MetricCard({
  label,
  value,
  tone = 'blue',
}: {
  label: string
  value: string
  tone?: 'blue' | 'orange' | 'green'
}) {
  const styles = {
    blue: 'bg-sky-50 border-sky-200 text-sky-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  }

  return (
    <div className={`rounded-2xl border-2 p-4 ${styles[tone]}`}>
      <p className="text-xs font-bold opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  )
}
