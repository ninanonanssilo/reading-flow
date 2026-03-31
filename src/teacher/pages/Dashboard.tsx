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
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
  'ai-adjusted': 'bg-rose-50 text-rose-700 border-rose-200',
  'co-regulated': 'bg-orange-50 text-orange-700 border-orange-200',
  'shared-regulated': 'bg-sky-50 text-sky-700 border-sky-200',
  'self-regulated': 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedName, setSelectedName] = useState(mockStudents[0]?.name ?? '')
  const student = useMemo(
    () => mockStudents.find((item) => item.name === selectedName) ?? mockStudents[0],
    [selectedName],
  )

  const handleLogout = () => {
    logout()
    navigate('/welcome')
  }

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
        borderColor: ['#2B7FFF', '#FF6B35', '#00C9A7'][index],
        backgroundColor: ['rgba(43,127,255,0.15)', 'rgba(255,107,53,0.15)', 'rgba(0,201,167,0.15)'][index],
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
        borderColor: '#1A1D23',
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
        backgroundColor: ['#2B7FFF', '#FF6B35', '#FF6B9D', '#7C5CFC', '#00C9A7'],
      },
    ],
  }

  const srlBarData = {
    labels: mockStudents.slice(0, 5).map((item) => item.name),
    datasets: [
      { label: 'Orientation', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[0].pct), backgroundColor: '#E8F1FF' },
      { label: 'Planning', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[1].pct), backgroundColor: '#bfdbfe' },
      { label: 'Monitoring', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[2].pct), backgroundColor: '#93c5fd' },
      { label: 'Evaluation', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[3].pct), backgroundColor: '#60a5fa' },
      { label: 'Reading', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[4].pct), backgroundColor: '#2B7FFF' },
      { label: 'Rereading', data: mockStudents.slice(0, 5).map((item) => item.srProcesses[5].pct), backgroundColor: '#1A5DC8' },
    ],
  }

  const studentLineData = {
    labels: ['1주', '2주', '3주', '4주', '5주', '6주', '7주', '8주'],
    datasets: [
      {
        label: `${student.name} CWPM`,
        data: student.cwpmProgress,
        borderColor: '#2B7FFF',
        backgroundColor: 'rgba(43,127,255,0.18)',
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
        backgroundColor: ['#2B7FFF', '#FF6B35', '#FF6B9D', '#7C5CFC', '#00C9A7'],
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] px-6 py-6 text-[var(--text-main)] md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <header className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <Link to="/welcome" className="flex items-center gap-2 transition hover:opacity-80">
              <span className="text-lg">🧑‍🚀</span>
              <span className="text-base font-extrabold text-[var(--secondary)]">리딩플로우</span>
              <span className="border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-xs font-bold text-white">교사</span>
            </Link>
            <div className="flex items-center gap-2">
              {user && <span className="text-sm font-bold text-[var(--text-sub)]">{user.username}</span>}
              <button
                type="button"
                onClick={handleLogout}
                className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-light)] shadow-sm transition hover:text-red-500"
              >
                로그아웃
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-main)]">학급 읽기 유창성 대시보드</h1>
          <p className="mt-2 text-sm text-[var(--text-sub)]">
            BASA 오류, SRL 프로세스, HHAIR 조절 수준을 한 화면에서 확인합니다.
          </p>
        </header>

        {/* KPI 카드 */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['학급 평균 CWPM', `${classAverageCwpm}`, 'border-l-[var(--primary)]'],
            ['학급 평균 정확도', `${classAverageAccuracy}%`, 'border-l-[var(--secondary)]'],
            ['총 읽기 세션 수', `${totalSessions}`, 'border-l-[var(--accent-orange)]'],
            ['자기교정 비율', `${selfCorrectionRatio}`, 'border-l-[var(--accent-purple)]'],
          ].map(([label, value, border]) => (
            <div key={label} className={`border border-[var(--border)] border-l-4 ${border} bg-white p-5 shadow-sm`}>
              <div className="text-sm font-bold text-[var(--text-light)]">{label}</div>
              <div className="mt-2 text-3xl font-extrabold">{value}</div>
            </div>
          ))}
        </section>

        {/* 차트 그리드 */}
        <section className="mt-8 grid gap-5 xl:grid-cols-2">
          <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">학급 CWPM 추이</h2>
            <div className="mt-4 h-80">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">BASA 오류 분포</h2>
            <div className="mt-4 h-80">
              <Bar
                data={basaBarData}
                options={{ indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
          <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">SRL 프로세스 분석</h2>
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
          <div className="border border-[var(--border)] bg-[var(--text-main)] p-6 text-white shadow-sm">
            <h2 className="text-lg font-extrabold">HHAIR 조절 상태</h2>
            <div className="mt-5 grid gap-2">
              {mockStudents.map((item) => (
                <div key={item.name} className="flex items-center justify-between bg-white/10 px-4 py-3">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.srlBadge}</div>
                  </div>
                  <span className={`border px-3 py-1 text-xs font-bold ${regulationTone[item.regulationLevel]}`}>
                    {regulationLabel[item.regulationLevel]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 학생 상세 */}
        <section className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">학생 테이블</h2>
              <select
                value={selectedName}
                onChange={(event) => setSelectedName(event.target.value)}
                className="border border-[var(--border)] bg-white px-3 py-2 text-sm font-bold"
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
                  <tr className="text-left text-[var(--text-light)]">
                    <th className="pb-3 font-bold">이름</th>
                    <th className="pb-3 font-bold">최근 CWPM</th>
                    <th className="pb-3 font-bold">정확도</th>
                    <th className="pb-3 font-bold">주요 오류</th>
                    <th className="pb-3 font-bold">SRL</th>
                    <th className="pb-3 font-bold">추세</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((item) => {
                    const dominant = Object.entries(item.errorDist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
                    return (
                      <tr
                        key={item.name}
                        className={`border-t border-[var(--border)] ${item.name === selectedName ? 'bg-[var(--primary-light)]' : ''}`}
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

          <div className="space-y-5">
            <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">{student.name} 상세</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`border px-3 py-1 text-xs font-bold ${regulationTone[student.regulationLevel]}`}>
                  {regulationLabel[student.regulationLevel]}
                </span>
                <span className="border border-[var(--border)] bg-[var(--bg-main)] px-3 py-1 text-xs font-bold text-[var(--text-sub)]">
                  배지 {student.srlBadge}
                </span>
                <span className="border border-[var(--border)] bg-[var(--bg-main)] px-3 py-1 text-xs font-bold text-[var(--text-sub)]">
                  재분류 이력 3건 / 2주
                </span>
              </div>
              <div className="mt-4 h-64">
                <Line data={studentLineData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold">개인 오류 분포</h2>
                <div className="mt-4 h-56">
                  <Doughnut data={studentDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold">읽기 과정 타임라인</h2>
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
                  <div className="mb-2 flex items-center justify-between text-sm font-bold text-[var(--text-light)]">
                    <span>자기평가 정확도</span>
                    <span>78%</span>
                  </div>
                  <div className="h-3 overflow-hidden bg-[var(--bg-main)]">
                    <div className="h-full w-[78%] bg-[var(--primary)]" />
                  </div>
                </div>
                <textarea
                  className="mt-6 min-h-28 w-full border border-[var(--border)] p-4 text-sm outline-none"
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
