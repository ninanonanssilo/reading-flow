import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useScreenLogger } from '../../hooks/useScreenLogger'
import { useFlow } from '../../context/FlowContext'
import { badges as badgeDefs, levels } from '../../data/constants'
import Lumi from '../components/Lumi'
import LumiDialogue from '../components/LumiDialogue'
import { getCompletionDialogue } from '../../data/lumiDialogues'
import type { Badge } from '../../types'

interface CompletionState {
  stars: number
  nextLevel: number
  newBadges: Badge[]
}

export default function Completion() {
  useScreenLogger('completion')
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

  const overallProgress = nextLevel
    ? Math.min(
        Math.min(100, (player.totalSessions / nextLevel.requiredSessions) * 100),
        Math.min(100, (player.totalStars / nextLevel.requiredStars) * 100),
      )
    : 100

  const compNavigate = useNavigate()
  const [showDialogue, setShowDialogue] = useState(true)
  const completionLines = getCompletionDialogue(stars, !!didLevelUp, newBadges.length)
  const handleCompDialogue = (choices: Record<string, string>) => {
    setShowDialogue(false)
    const last = choices['comp-next']
    if (last === 'again') compNavigate('/passage')
    else if (last === 'history') compNavigate('/history')
  }
  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      {showDialogue && <LumiDialogue lines={completionLines} onComplete={handleCompDialogue} playerName={player.name} />}
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10">
        {/* 레벨업 연출 */}
        {didLevelUp ? (
          <div className="mb-6 text-center animate-slide-up">
            <Lumi mood="cheering" size="lg" message={`축하해! Lv.${currentLevel.level} ${currentLevel.name}에 도달했어!`} />
            <h1 className="mt-3 text-3xl font-extrabold text-[var(--text-main)]">레벨 업!</h1>
            <p className="mt-1 text-lg font-bold text-[var(--primary)]">
              Lv.{currentLevel.level} {currentLevel.name} 도달!
            </p>
          </div>
        ) : (
          <div className="mb-6 text-center animate-slide-up">
            <Lumi mood="happy" size="lg" message="오늘도 잘했어! 다음에 또 만나자." />
            <h1 className="mt-3 text-3xl font-extrabold text-[var(--text-main)]">오늘의 탐험 완료!</h1>
            <p className="mt-2 text-base text-[var(--text-sub)]">잘했어요, {player.name}! 결과가 저장되었습니다.</p>
          </div>
        )}

        {/* 별 획득 */}
        <div className="mb-4 w-full border border-[var(--border)] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[var(--text-light)]">이번에 획득한 별</p>
          <div className="mt-2 text-5xl">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        </div>

        {/* 새 뱃지 획득 */}
        {newBadges.length > 0 && (
          <div className="mb-4 w-full border-2 border-[var(--accent-yellow)] bg-amber-50 p-5 shadow-sm animate-slide-up">
            <div className="mb-3 flex items-center gap-2">
              <Lumi mood="cheering" size="sm" showBubble={false} />
              <h3 className="text-base font-extrabold text-amber-800">새 뱃지다! 컬렉션이 늘었어!</h3>
            </div>
            <div className="space-y-2">
              {newBadges.map((b) => {
                const def = badgeDefs.find((d) => d.id === b.id)
                if (!def) return null
                return (
                  <div key={b.id} className="flex items-center gap-3 border border-[var(--border)] bg-white px-4 py-3">
                    <span className="text-2xl">{def.icon}</span>
                    <div>
                      <p className="text-sm font-extrabold text-[var(--text-main)]">{def.name}</p>
                      <p className="text-xs text-[var(--text-sub)]">{def.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 결과 요약 */}
        <div className="mb-4 w-full grid grid-cols-3 gap-3">
          <div className="border border-[var(--border)] bg-white p-4 text-center">
            <div className="text-[10px] font-bold text-[var(--text-light)]">정확도</div>
            <div className="mt-1 text-2xl font-extrabold text-[var(--accent-orange)]">{latestSession.analysis.accuracy}%</div>
          </div>
          <div className="border border-[var(--border)] bg-white p-4 text-center">
            <div className="text-[10px] font-bold text-[var(--text-light)]">CWPM</div>
            <div className="mt-1 text-2xl font-extrabold text-[var(--primary)]">{latestSession.analysis.cwpm}</div>
          </div>
          <div className="border border-[var(--border)] bg-white p-4 text-center">
            <div className="text-[10px] font-bold text-[var(--text-light)]">레벨</div>
            <div className="mt-1 text-2xl font-extrabold text-[var(--secondary)]">Lv.{currentLevel.level}</div>
          </div>
        </div>

        {/* 다음 레벨 진행도 */}
        {nextLevel && (
          <div className="mb-4 w-full border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
              <span>다음 목표: {nextLevel.icon} {nextLevel.name}</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden bg-[var(--bg-main)]">
              <div
                className="h-full bg-[var(--primary)] transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-[var(--text-light)]">
              세션 {player.totalSessions}/{nextLevel.requiredSessions} · 별 {player.totalStars}/{nextLevel.requiredStars}
            </p>
          </div>
        )}

        {/* 누적 정보 */}
        <div className="mb-8 w-full bg-[var(--primary-light)] p-5 text-center">
          <p className="text-sm font-bold text-[var(--primary-dark)]">
            누적 {player.totalSessions}회 · ⭐ {player.totalStars}개 · 🏅 {player.badges.length}개
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex w-full flex-col gap-3">
          <Link
            to="/passage"
            className="bg-[var(--primary)] py-4 text-center text-base font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)]"
          >
            다시 읽기 →
          </Link>
          <Link
            to="/"
            className="border border-[var(--border)] bg-white py-4 text-center text-base font-extrabold text-[var(--text-sub)] transition hover:shadow-sm"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  )
}
