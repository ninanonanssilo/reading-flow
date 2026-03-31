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

        {/* 학생 테이블 */}
        <section className="mt-8 border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">학생 목록</h2>
          <p className="mb-4 text-xs text-[var(--text-light)]">이름을 클릭하면 개별 학습 현황을 확인할 수 있습니다.</p>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-light)] border-b-2 border-[var(--border)]">
                  <th className="pb-3 font-bold">이름</th>
                  <th className="pb-3 font-bold">최근 CWPM</th>
                  <th className="pb-3 font-bold">정확도</th>
                  <th className="pb-3 font-bold">주요 오류</th>
                  <th className="pb-3 font-bold">SRL 점수</th>
                  <th className="pb-3 font-bold">조절 수준</th>
                  <th className="pb-3 font-bold">추세</th>
                </tr>
              </thead>
              <tbody>
                {mockStudents.map((item) => {
                  const dominant = Object.entries(item.errorDist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
                  const isSelected = item.name === selectedName
                  return (
                    <tr
                      key={item.name}
                      onClick={() => setSelectedName(item.name)}
                      className={`border-t border-[var(--border)] cursor-pointer transition ${
                        isSelected
                          ? 'bg-[var(--primary-light)] border-l-4 border-l-[var(--primary)]'
                          : 'hover:bg-[var(--bg-main)]'
                      }`}
                    >
                      <td className={`py-3 font-bold ${isSelected ? 'text-[var(--primary)]' : ''}`}>{item.name}</td>
                      <td className="py-3">{item.recentCwpm}</td>
                      <td className="py-3">{item.accuracy}%</td>
                      <td className="py-3">{dominant}</td>
                      <td className="py-3">{item.srlScore}</td>
                      <td className="py-3">
                        <span className={`border px-2 py-0.5 text-xs font-bold ${regulationTone[item.regulationLevel]}`}>
                          {regulationLabel[item.regulationLevel]}
                        </span>
                      </td>
                      <td className="py-3 text-lg">{item.trend}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 선택된 학생 상세 */}
        <section className="mt-8 border-l-4 border-l-[var(--primary)] bg-white border border-[var(--border)] p-6 shadow-sm animate-slide-up" key={selectedName}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-main)]">{student.name} 학습 현황</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`border px-3 py-1 text-xs font-bold ${regulationTone[student.regulationLevel]}`}>
                  {regulationLabel[student.regulationLevel]}
                </span>
                <span className="border border-[var(--border)] bg-[var(--bg-main)] px-3 py-1 text-xs font-bold text-[var(--text-sub)]">
                  배지 {student.srlBadge}
                </span>
                <span className="border border-[var(--border)] bg-[var(--bg-main)] px-3 py-1 text-xs font-bold text-[var(--text-sub)]">
                  CWPM {student.recentCwpm} · 정확도 {student.accuracy}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="border border-[var(--border)] bg-[var(--bg-main)] p-5">
              <h3 className="text-base font-extrabold">CWPM 추이</h3>
              <div className="mt-3 h-56">
                <Line data={studentLineData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="border border-[var(--border)] bg-[var(--bg-main)] p-5">
              <h3 className="text-base font-extrabold">오류 분포</h3>
              <div className="mt-3 h-56">
                <Doughnut data={studentDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <div className="border border-[var(--border)] bg-[var(--bg-main)] p-5">
              <h3 className="text-base font-extrabold">읽기 과정 타임라인</h3>
              <div className="mt-4 flex items-center gap-3 text-2xl">
                <span>🎯</span><span className="text-[var(--text-light)]">→</span>
                <span>🎤</span><span className="text-[var(--text-light)]">→</span>
                <span>✅</span><span className="text-[var(--text-light)]">→</span>
                <span>🔁</span>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm font-bold text-[var(--text-light)]">
                  <span>자기평가 정확도</span>
                  <span>78%</span>
                </div>
                <div className="h-3 overflow-hidden bg-white">
                  <div className="h-full w-[78%] bg-[var(--primary)]" />
                </div>
              </div>
            </div>
            <div className="border border-[var(--border)] bg-[var(--bg-main)] p-5">
              <h3 className="text-base font-extrabold">교사 메모</h3>
              <textarea
                className="mt-3 min-h-24 w-full border border-[var(--border)] bg-white p-4 text-sm outline-none"
                defaultValue={`${student.name}은 최근 자기교정 비율이 높아졌고, 생략 오류는 줄어드는 추세입니다.`}
              />
            </div>
          </div>
        </section>

        {/* 학급 전체 차트 */}
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
      </div>
    </main>
  )
}
