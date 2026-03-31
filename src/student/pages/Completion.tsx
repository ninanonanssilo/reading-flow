import { Link, Navigate, useLocation } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { badges as badgeDefs, levels } from '../../data/constants'
import type { Badge } from '../../types'

interface CompletionState {
  stars: number
  nextLevel: number
  newBadges: Badge[]
}

export default function Completion() {
  const { player } = useFlow()
  const location = useLocation()
  const state = location.state as CompletionState | null

  const latestSession = player.sessions[player.sessions.length - 1]
  if (!latestSession) {
    return <Navigate to="/" replace />
  }

  const stars = state?.stars ?? (latestSession.analysis.accuracy >= 85 ? 3 : latestSession.analysis.accuracy >= 60 ? 2 : 1)
  const currentLevel = levels.find((l) => l.level === player.level) ?? levels[0]
  const prevLevel = state ? levels.find((l) => l.level !== state.nextLevel && l.level === state.nextLevel - 1) : null
  const didLevelUp = prevLevel && state && prevLevel.level < state.nextLevel
  const newBadges = state?.newBadges ?? []
  const nextLevel = levels.find((l) => l.level === player.level + 1)

  // 다음 레벨 진행도
  const overallProgress = nextLevel
    ? Math.min(
        Math.min(100, (player.totalSessions / nextLevel.requiredSessions) * 100),
        Math.min(100, (player.totalStars / nextLevel.requiredStars) * 100),
      )
    : 100

  return (
    <main className="min-h-screen bg-[#FFF9F0]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-yellow-100/70 blur-3xl" />
        <div className="absolute bottom-10 -left-10 h-48 w-48 rounded-full bg-green-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10">
        {/* 레벨업 연출 */}
        {didLevelUp ? (
          <div className="mb-6 text-center">
            <div className="mb-2 text-7xl animate-bounce">{currentLevel.icon}</div>
            <h1 className="text-3xl font-extrabold text-amber-900">레벨 업!</h1>
            <p className="mt-1 text-lg font-bold text-orange-600">
              Lv.{currentLevel.level} {currentLevel.name} 도달!
            </p>
            <div className="mt-3 inline-block rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2 text-sm font-extrabold text-white shadow-lg">
              축하해요! 새로운 단계에 올랐어요!
            </div>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <div className="mb-2 text-7xl animate-float">{currentLevel.icon}</div>
            <h1 className="text-3xl font-extrabold text-amber-900">오늘의 탐험 완료!</h1>
            <p className="mt-2 text-base text-amber-700/70">잘했어요, {player.name}! 결과가 저장되었습니다.</p>
          </div>
        )}

        {/* 별 획득 */}
        <div className="mb-5 rounded-3xl bg-white p-6 shadow-lg w-full text-center">
          <p className="text-sm font-bold text-amber-600">이번에 획득한 별</p>
          <div className="mt-2 text-5xl">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        </div>

        {/* 새 뱃지 획득 */}
        {newBadges.length > 0 && (
          <div className="mb-5 w-full rounded-3xl border-3 border-yellow-300 bg-yellow-50 p-5 shadow-lg">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🏅</span>
              <h3 className="text-lg font-extrabold text-yellow-800">새 뱃지 획득!</h3>
            </div>
            <div className="space-y-2">
              {newBadges.map((b) => {
                const def = badgeDefs.find((d) => d.id === b.id)
                if (!def) return null
                return (
                  <div key={b.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="text-3xl">{def.icon}</span>
                    <div>
                      <p className="text-sm font-extrabold text-amber-900">{def.name}</p>
                      <p className="text-xs text-amber-600">{def.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 결과 요약 */}
        <div className="mb-5 w-full grid grid-cols-3 gap-3">
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

        {/* 다음 레벨 진행도 */}
        {nextLevel && (
          <div className="mb-5 w-full rounded-3xl bg-white p-5 shadow-md">
            <div className="flex items-center justify-between text-sm font-bold text-amber-700">
              <span>다음 목표: {nextLevel.icon} {nextLevel.name}</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-amber-500">
              세션 {player.totalSessions}/{nextLevel.requiredSessions} · 별 {player.totalStars}/{nextLevel.requiredStars}
            </p>
          </div>
        )}

        {/* 누적 정보 */}
        <div className="mb-8 w-full rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-sm font-bold text-amber-700">
            누적 {player.totalSessions}회 · ⭐ {player.totalStars}개 · 🏅 {player.badges.length}개
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
