import { Link, Navigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { levels } from '../../data/constants'

export default function Completion() {
  const { player } = useFlow()
  const latestSession = player.sessions[player.sessions.length - 1]

  if (!latestSession) {
    return <Navigate to="/" replace />
  }

  const currentLevel = levels.find((l) => l.level === player.level) ?? levels[0]
  const stars = latestSession.analysis.accuracy >= 85 ? 3 : latestSession.analysis.accuracy >= 60 ? 2 : 1

  return (
    <main className="min-h-screen bg-[#FFF9F0]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-yellow-100/70 blur-3xl" />
        <div className="absolute bottom-10 -left-10 h-48 w-48 rounded-full bg-green-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10">
        {/* 축하 */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-7xl animate-float">{currentLevel.icon}</div>
          <h1 className="text-3xl font-extrabold text-amber-900">오늘의 탐험 완료! 🎉</h1>
          <p className="mt-2 text-base text-amber-700/70">잘했어요! 결과가 저장되었습니다.</p>
        </div>

        {/* 별 획득 */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-lg w-full text-center">
          <p className="text-sm font-bold text-amber-600">이번에 획득한 별</p>
          <div className="mt-2 text-5xl">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        </div>

        {/* 결과 요약 */}
        <div className="mb-6 w-full grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-md">
            <div className="text-xs font-bold text-orange-400">정확도</div>
            <div className="mt-1 text-2xl font-extrabold text-orange-700">{latestSession.analysis.accuracy}%</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-md">
            <div className="text-xs font-bold text-sky-400">CWPM</div>
            <div className="mt-1 text-2xl font-extrabold text-sky-700">{latestSession.analysis.cwpm}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-md">
            <div className="text-xs font-bold text-green-400">레벨</div>
            <div className="mt-1 text-2xl font-extrabold text-green-700">Lv.{currentLevel.level}</div>
          </div>
        </div>

        {/* 누적 정보 */}
        <div className="mb-8 w-full rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-sm font-bold text-amber-700">
            누적 {player.totalSessions}회 · ⭐ {player.totalStars}개 · {currentLevel.name}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex w-full flex-col gap-3">
          <Link
            to="/passage"
            className="rounded-full bg-orange-500 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-orange-200 transition hover:scale-105"
          >
            🚀 다시 읽기
          </Link>
          <Link
            to="/"
            className="rounded-full bg-white py-4 text-center text-base font-extrabold text-amber-700 shadow-md transition hover:scale-105"
          >
            🏠 홈으로
          </Link>
        </div>
      </div>
    </main>
  )
}
