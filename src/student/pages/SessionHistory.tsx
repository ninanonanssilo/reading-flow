import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useFlow } from '../../context/FlowContext'
import { passages } from '../../data/passages'
import Lumi from '../components/Lumi'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Legend, Tooltip)

type ViewMode = 'list' | 'chart'
type MetricType = 'cwpm' | 'accuracy'

export default function SessionHistory() {
  const { player } = useFlow()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('cwpm')

  const sessions = player.sessions ?? []
  const sortedSessions = useMemo(() => [...sessions].reverse(), [sessions])

  const chartData = useMemo(() => ({
    labels: sessions.map((_, i) => `${i + 1}회`),
    datasets: [{
      label: selectedMetric === 'cwpm' ? 'CWPM' : '정확도 (%)',
      data: sessions.map((s) => selectedMetric === 'cwpm' ? s.analysis.cwpm : s.analysis.accuracy),
      borderColor: 'var(--primary)',
      backgroundColor: 'rgba(43, 127, 255, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: sessions.map((s, idx) => {
        const val = selectedMetric === 'cwpm' ? s.analysis.cwpm : s.analysis.accuracy
        const prev = idx > 0
          ? (selectedMetric === 'cwpm' ? sessions[idx - 1].analysis.cwpm : sessions[idx - 1].analysis.accuracy)
          : val
        return val >= prev ? 'var(--secondary)' : 'var(--accent-orange)'
      }),
    }],
  }), [sessions, selectedMetric])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: unknown) => {
            const y = (ctx as { parsed: { y: number } }).parsed.y
            return selectedMetric === 'cwpm' ? `${y.toFixed(1)} CWPM` : `${y.toFixed(1)}%`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: selectedMetric === 'accuracy',
        max: selectedMetric === 'accuracy' ? 100 : undefined,
        title: { display: true, text: selectedMetric === 'cwpm' ? 'CWPM' : '정확도 (%)' },
      },
      x: { title: { display: true, text: '세션' } },
    },
  }

  const metacognitionData = useMemo(() => {
    const withRating = sessions.filter((s) => s.selfAssessment)
    return {
      labels: withRating.map((_, i) => `${i + 1}회`),
      datasets: [
        {
          label: '자기평가',
          data: withRating.map((s) => s.selfAssessment!.selfRating),
          borderColor: 'var(--accent-purple)',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'AI 평가',
          data: withRating.map((s) => Math.max(1, Math.min(5, Math.round(s.analysis.accuracy / 20)))),
          borderColor: 'var(--primary)',
          fill: false,
          tension: 0.3,
        },
      ],
    }
  }, [sessions])

  const stats = useMemo(() => {
    if (sessions.length === 0) return null
    const cwpms = sessions.map((s) => s.analysis.cwpm)
    const accs = sessions.map((s) => s.analysis.accuracy)
    const latest = sessions[sessions.length - 1]
    const first = sessions[0]
    return {
      avgCwpm: cwpms.reduce((a, b) => a + b, 0) / cwpms.length,
      maxCwpm: Math.max(...cwpms),
      avgAccuracy: accs.reduce((a, b) => a + b, 0) / accs.length,
      cwpmGrowth: latest.analysis.cwpm - first.analysis.cwpm,
      accGrowth: latest.analysis.accuracy - first.analysis.accuracy,
      totalSessions: sessions.length,
      goalAchieved: sessions.filter((s) => {
        if (s.goalType === 'speed') return s.analysis.cwpm >= 60
        if (s.goalType === 'accuracy') return s.analysis.accuracy >= 85
        return s.analysis.totalErrors === 0
      }).length,
    }
  }, [sessions])

  const getPassageTitle = (id: string) => passages.find((p) => p.id === id)?.title ?? id
  const getGoalLabel = (type: string) =>
    ({ speed: '🚀 속도', accuracy: '🎯 정확도', reduction: '🛠️ 오류 줄이기' }[type] ?? type)
  const getStarsDisplay = (accuracy: number) =>
    accuracy >= 85 ? '⭐⭐⭐' : accuracy >= 60 ? '⭐⭐' : '⭐'

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-5">
        <Link
          to="/"
          className="flex items-center gap-2 border border-[var(--border)] bg-white px-5 py-2 text-base font-extrabold text-[var(--primary)] shadow-sm"
        >
          ← 돌아가기
        </Link>
        <h1 className="text-lg font-extrabold text-[var(--text-main)]">나의 읽기 여행 기록</h1>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {sessions.length === 0 ? (
          <div className="py-20 text-center">
            <Lumi mood="idle" message="아직 읽기 기록이 없어! 첫 번째 탐험을 시작해볼까?" size="lg" />
            <Link
              to="/passage"
              className="mt-6 inline-block bg-[var(--primary)] px-8 py-3 text-base font-extrabold text-white shadow-md"
            >
              탐험 시작하기 →
            </Link>
          </div>
        ) : (
          <>
            {stats && (
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="평균 CWPM" value={stats.avgCwpm.toFixed(1)} sub={`성장 ${stats.cwpmGrowth >= 0 ? '+' : ''}${stats.cwpmGrowth.toFixed(1)}`} color={stats.cwpmGrowth >= 0 ? 'text-[var(--secondary)]' : 'text-[var(--accent-orange)]'} />
                <StatCard label="평균 정확도" value={`${stats.avgAccuracy.toFixed(1)}%`} sub={`성장 ${stats.accGrowth >= 0 ? '+' : ''}${stats.accGrowth.toFixed(1)}%`} color={stats.accGrowth >= 0 ? 'text-[var(--secondary)]' : 'text-[var(--accent-orange)]'} />
                <StatCard label="최고 CWPM" value={stats.maxCwpm.toFixed(1)} sub="개인 최고 기록" color="text-[var(--accent-purple)]" />
                <StatCard label="목표 달성" value={`${stats.goalAchieved}/${stats.totalSessions}`} sub={`달성률 ${((stats.goalAchieved / stats.totalSessions) * 100).toFixed(0)}%`} color="text-[var(--primary)]" />
              </div>
            )}

            <div className="mb-4 flex gap-2">
              {(['list', 'chart'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-bold transition ${viewMode === mode ? 'bg-[var(--primary)] text-white' : 'border border-[var(--border)] bg-white text-[var(--text-sub)]'}`}
                >
                  {mode === 'list' ? '세션 목록' : '추이 그래프'}
                </button>
              ))}
            </div>

            {viewMode === 'chart' ? (
              <div className="space-y-6">
                <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[var(--text-main)]">읽기 실력 변화</h3>
                    <div className="flex gap-1">
                      {(['cwpm', 'accuracy'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMetric(m)}
                          className={`px-3 py-1 text-xs font-bold ${selectedMetric === m ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-main)] text-[var(--text-sub)]'}`}
                        >
                          {m === 'cwpm' ? 'CWPM' : '정확도'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Line data={chartData} options={chartOptions} />
                </div>

                {metacognitionData.datasets[0].data.length > 0 && (
                  <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-base font-extrabold text-[var(--text-main)]">자기평가 vs AI 평가 (메타인지)</h3>
                    <p className="mb-3 text-xs text-[var(--text-light)]">두 선이 가까울수록 자기 실력을 정확하게 파악하고 있다는 뜻이에요.</p>
                    <Line
                      data={metacognitionData}
                      options={{
                        responsive: true,
                        scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
                        plugins: { legend: { position: 'bottom' as const } },
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedSessions.map((session, idx) => (
                  <SessionCard
                    key={idx}
                    session={session}
                    index={sessions.length - idx}
                    passageTitle={getPassageTitle(session.passageId)}
                    goalLabel={getGoalLabel(session.goalType)}
                    stars={getStarsDisplay(session.analysis.accuracy)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="border border-[var(--border)] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-[var(--text-light)]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[var(--text-main)]">{value}</p>
      <p className={`mt-0.5 text-xs font-bold ${color}`}>{sub}</p>
    </div>
  )
}

function SessionCard({ session, index, passageTitle, goalLabel, stars }: {
  session: { analysis: { accuracy: number; cwpm: number; errorCounts: { substitution: number; omission: number; addition: number; repetition: number; selfCorrection: number } }; selfAssessment?: { selfRating: number } | null; scaffoldOutput?: { hhairLevel?: string } | null; timestamp?: number }
  index: number
  passageTitle: string
  goalLabel: string
  stars: string
}) {
  const [expanded, setExpanded] = useState(false)
  const acc = session.analysis.accuracy
  const cwpm = session.analysis.cwpm
  const ec = session.analysis.errorCounts
  const aiRating = Math.max(1, Math.min(5, Math.round(acc / 20)))
  const selfRating = session.selfAssessment?.selfRating
  const gap = selfRating != null ? Math.abs(selfRating - aiRating) : null
  const hhairLevel = session.scaffoldOutput?.hhairLevel

  return (
    <div className="border border-[var(--border)] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-[var(--bg-main)]"
      >
        <div className="flex h-10 w-10 items-center justify-center bg-[var(--primary-light)] text-sm font-extrabold text-[var(--primary)]">
          {index}
        </div>
        <div className="flex-1">
          <p className="text-sm font-extrabold text-[var(--text-main)]">{passageTitle}</p>
          <p className="mt-0.5 text-xs text-[var(--text-light)]">
            {goalLabel} · 정확도 {acc.toFixed(1)}% · CWPM {cwpm.toFixed(1)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm">{stars}</div>
          {session.timestamp && (
            <p className="text-[10px] text-[var(--text-light)]">
              {new Date(session.timestamp).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>
        <span className="text-xs text-[var(--text-light)]">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] px-4 pb-4 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="bg-[var(--bg-main)] p-2">
              <span className="text-[var(--text-light)]">정확도</span>
              <p className="font-extrabold text-[var(--text-main)]">{acc.toFixed(1)}%</p>
            </div>
            <div className="bg-[var(--bg-main)] p-2">
              <span className="text-[var(--text-light)]">CWPM</span>
              <p className="font-extrabold text-[var(--text-main)]">{cwpm.toFixed(1)}</p>
            </div>
            <div className="bg-[var(--bg-main)] p-2">
              <span className="text-[var(--text-light)]">자기평가</span>
              <p className="font-extrabold text-[var(--text-main)]">{selfRating != null ? `${selfRating}/5` : '—'}</p>
            </div>
            <div className="bg-[var(--bg-main)] p-2">
              <span className="text-[var(--text-light)]">메타인지 갭</span>
              <p className={`font-extrabold ${gap == null ? '' : gap <= 1 ? 'text-[var(--secondary)]' : 'text-[var(--accent-orange)]'}`}>
                {gap != null ? (gap === 0 ? '정확!' : `\u00B1${gap}`) : '—'}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-1 text-xs font-bold text-[var(--text-sub)]">오류 유형</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { key: 'substitution', label: '대치', color: 'bg-rose-100 text-rose-700' },
                { key: 'omission', label: '생략', color: 'bg-orange-100 text-orange-700' },
                { key: 'addition', label: '첨가', color: 'bg-sky-100 text-sky-700' },
                { key: 'repetition', label: '반복', color: 'bg-purple-100 text-purple-700' },
                { key: 'selfCorrection', label: '자기교정', color: 'bg-emerald-100 text-emerald-700' },
              ].map(({ key, label, color }) => (
                <span key={key} className={`${color} px-2 py-1 font-bold`}>{label} {ec[key as keyof typeof ec] ?? 0}</span>
              ))}
            </div>
          </div>
          {hhairLevel && (
            <div className="mt-3">
              <span className="text-xs font-bold text-[var(--text-sub)]">HHAIR 수준: </span>
              <span className={`text-xs font-bold px-2 py-0.5 border ${
                hhairLevel === 'self-regulated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                hhairLevel === 'shared-regulated' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                hhairLevel === 'co-regulated' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {hhairLevel === 'self-regulated' ? '자기 조절' :
                 hhairLevel === 'shared-regulated' ? '공유 조절' :
                 hhairLevel === 'co-regulated' ? '공동 조절' : 'AI 조절'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
