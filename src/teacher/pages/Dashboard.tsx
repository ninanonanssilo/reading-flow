import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { useMemo, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Link } from 'react-router-dom'
import { mockStudents } from '../../data/mockStudents'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

const regulationLabel = {
  'ai-adjusted': 'AI 조절',
  'co-regulated': '공동 조절',
  'shared-regulated': '공유 조절',
  'self-regulated': '자기 조절',
}

const regulationTone = {
  'ai-adjusted': 'bg-rose-100 text-rose-700',
  'co-regulated': 'bg-orange-100 text-orange-700',
  'shared-regulated': 'bg-sky-100 text-sky-700',
  'self-regulated': 'bg-emerald-100 text-emerald-700',
}

export default function Dashboard() {
  const [selectedName, setSelectedName] = useState(mockStudents[0]?.name ?? '')
  const student = useMemo(
    () => mockStudents.find((item) => item.name === selectedName) ?? mockStudents[0],
    [selectedName],
  )

  const classAverageCwpm = Math.round(
    mockStudents.reduce((sum, item) => sum + item.recentCwpm, 0) / mockStudents.length,
  )
  const classAverageAccuracy = Number(
    (
      mockStudents.reduce((sum, item) => sum + item.accuracy, 0) / mockStudents.length
    ).toFixed(1),
  )
  const totalSessions = mockStudents.length * 8
  const selfCorrectionRatio = Number(
    (
      mockStudents.reduce((sum, item) => sum + item.errorDist.SC, 0) / mockStudents.length
    ).toFixed(1),
  )

  const lineData = {
    labels: ['1주', '2주', '3주', '4주', '5주', '6주', '7주', '8주'],
    datasets: [
      ...mockStudents.slice(0, 3).map((item, index) => ({
        label: item.name,
        data: item.cwpmProgress,
        borderColor: ['#4A7DFF', '#FF8C42', '#4ECDC4'][index],
        backgroundColor: ['rgba(74,125,255,0.15)', 'rgba(255,140,66,0.15)', 'rgba(78,205,196,0.15)'][index],
        tension: 0.35,
        fill: false,
      })),
      {
        label: '학급 평균',
        data: Array.from({ length: 8 }, (_, week) =>
          Math.round(
            mockStudents.reduce((sum, item) => sum + item.cwpmProgress[week], 0) / mockStudents.length,
          ),
        ),
        borderColor: '#111827',
        borderDash: [6, 4],
        tension: 0.3,
      },
    ],
  }

  const basaBarData = {
    labels: ['대치', '생략', '첨가', '반복', '자기교정'],
    datasets: [
      {
        label: '오류 수',
        data: [
          mockStudents.reduce((sum, item) => sum + item.errorDist.S, 0),
          mockStudents.reduce((sum, item) => sum + item.errorDist.O, 0),
          mockStudents.reduce((sum, item) => sum + item.errorDist.A, 0),
          mockStudents.reduce((sum, item) => sum + item.errorDist.R, 0),
          mockStudents.reduce((sum, item) => sum + item.errorDist.SC, 0),
        ],
        backgroundColor: ['#4A7DFF', '#FF8C42', '#FF6B9D', '#A78BFA', '#4ECDC4'],
      },
    ],
  }

  const srlBarData = {
    labels: mockStudents.slice(0, 5).map((item) => item.name),
    datasets: [
      { label: 'Orientation', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[0].pct), backgroundColor: '#dbeafe' },
      { label: 'Planning', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[1].pct), backgroundColor: '#bfdbfe' },
      { label: 'Monitoring', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[2].pct), backgroundColor: '#93c5fd' },
      { label: 'Evaluation', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[3].pct), backgroundColor: '#60a5fa' },
      { label: 'Reading', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[4].pct), backgroundColor: '#3b82f6' },
      { label: 'Rereading', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[5].pct), backgroundColor: '#1d4ed8' },
    ],
  }

  const studentLineData = {
    labels: ['1주', '2주', '3주', '4주', '5주', '6주', '7주', '8주'],
    datasets: [
      {
        label: `${student.name} CWPM`,
        data: student.cwpmProgress,
        borderColor: '#4A7DFF',
        backgroundColor: 'rgba(74,125,255,0.18)',
        fill: true,
        tension: 0.35,
      },
    ],
  }

  const studentDoughnutData = {
    labels: ['S', 'O', 'A', 'R', 'SC'],
    datasets: [
      {
        data: [student.errorDist.S, student.errorDist.O, student.errorDist.A, student.errorDist.R, student.errorDist.SC],
        backgroundColor: ['#4A7DFF', '#FF8C42', '#FF6B9D', '#A78BFA', '#4ECDC4'],
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_45%,_#fff8ef_100%)] px-6 py-8 text-slate-900 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-lg">🚀</span>
              리딩플로우
            </Link>
            <Link
              to="/passage"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              학생 앱으로
            </Link>
          </div>
          <div className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            교사 대시보드
          </div>
          <h1 className="mt-3 text-4xl font-black">학급 읽기 유창성 대시보드</h1>
          <p className="mt-2 text-sm text-slate-600">
            BASA 오류, SRL 프로세스, HHAIR 조절 수준을 한 화면에서 확인합니다.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['학급 평균 CWPM', `${classAverageCwpm}`],
            ['학급 평균 정확도', `${classAverageAccuracy}%`],
            ['총 읽기 세션 수', `${totalSessions}`],
            ['자기교정 비율', `${selfCorrectionRatio}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-black">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
            <h2 className="text-xl font-black">학급 CWPM 추이</h2>
            <div className="mt-4 h-80">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
            <h2 className="text-xl font-black">BASA 오류 분포</h2>
            <div className="mt-4 h-80">
              <Bar
                data={basaBarData}
                options={{ indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
            <h2 className="text-xl font-black">SRL 프로세스 분석</h2>
            <div className="mt-4 h-80">
              <Bar
                data={srlBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { x: { stacked: true }, y: { stacked: true } },
                }}
              />
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-sm">
            <h2 className="text-xl font-black">HHAIR 조절 상태</h2>
            <div className="mt-5 grid gap-3">
              {mockStudents.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-slate-300">{item.srlBadge}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${regulationTone[item.regulationLevel]}`}>
                    {regulationLabel[item.regulationLevel]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">학생 테이블</h2>
              <select
                value={selectedName}
                onChange={(event) => setSelectedName(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
              >
                {mockStudents.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-3">이름</th>
                    <th className="pb-3">최근 CWPM</th>
                    <th className="pb-3">정확도</th>
                    <th className="pb-3">주요 오류</th>
                    <th className="pb-3">SRL</th>
                    <th className="pb-3">추세</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((item) => {
                    const dominant = Object.entries(item.errorDist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
                    return (
                      <tr
                        key={item.name}
                        className={`border-t border-slate-100 ${item.name === selectedName ? 'bg-sky-50' : ''}`}
                      >
                        <td className="py-3 font-bold">{item.name}</td>
                        <td>{item.recentCwpm}</td>
                        <td>{item.accuracy}%</td>
                        <td>{dominant}</td>
                        <td>{item.srlScore}</td>
                        <td>{item.trend}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-black">{student.name} 상세</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${regulationTone[student.regulationLevel]}`}>
                  {regulationLabel[student.regulationLevel]}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  배지 {student.srlBadge}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  재분류 이력 3건 / 2주
                </span>
              </div>
              <div className="mt-4 h-64">
                <Line data={studentLineData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
                <h2 className="text-xl font-black">개인 오류 분포</h2>
                <div className="mt-4 h-56">
                  <Doughnut data={studentDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
                <h2 className="text-xl font-black">읽기 과정 타임라인</h2>
                <div className="mt-5 flex items-center gap-3 text-2xl">
                  <span>🎯</span>
                  <span>→</span>
                  <span>🎤</span>
                  <span>→</span>
                  <span>✅</span>
                  <span>→</span>
                  <span>🔁</span>
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                    <span>자기평가 정확도</span>
                    <span>78%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[78%] rounded-full bg-sky-500" />
                  </div>
                </div>
                <textarea
                  className="mt-6 min-h-28 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none"
                  defaultValue={`${student.name}은 최근 자기교정 비율이 높아졌고, 생략 오류는 줄어드는 추세입니다.`}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
