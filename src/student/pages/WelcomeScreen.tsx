import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { badges as badgeDefs, levels } from '../../data/constants'

export default function WelcomeScreen() {
  const { player, setName } = useFlow()
  const currentLevel = levels.find((l) => l.level === player.level) ?? levels[0]
  const nextLevel = levels.find((l) => l.level === player.level + 1)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)

  // 닉네임 미설정 시 설정 페이지로
  if (!player.name) {
    return <Navigate to="/nickname" replace />
  }

  const handleNameSave = () => {
    const name = nameInput.trim()
    if (name) {
      setName(name)
      setEditingName(false)
    }
  }

  // 다음 레벨 진행도
  const sessionsProgress = nextLevel
    ? Math.min(100, (player.totalSessions / nextLevel.requiredSessions) * 100)
    : 100
  const starsProgress = nextLevel
    ? Math.min(100, (player.totalStars / nextLevel.requiredStars) * 100)
    : 100
  const overallProgress = Math.min(sessionsProgress, starsProgress)

  return (
    <main className="min-h-screen bg-[#FFF9F0]">
      {/* 배경 장식 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute top-1/2 -left-10 h-40 w-40 rounded-full bg-yellow-100/70 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-green-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-10">
        {/* 캐릭터 & 타이틀 */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-7xl animate-float">🚀</div>
          <h1 className="text-4xl font-extrabold text-amber-900 md:text-5xl">
            읽기 우주탐험대
          </h1>
          <p className="mt-3 text-lg text-amber-700/80">
            루미와 함께 읽기 실력을 키워보아요!
          </p>
        </div>

        {/* 플레이어 정보 카드 */}
        <div className="mb-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
              {currentLevel.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-600">Lv.{currentLevel.level} {currentLevel.name}</p>
              {editingName ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    maxLength={12}
                    className="w-full rounded-xl border-2 border-orange-300 bg-orange-50 px-3 py-1.5 text-base font-bold text-amber-900 outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={handleNameSave} className="text-lg">✅</button>
                  <button type="button" onClick={() => { setEditingName(false); setNameInput(player.name) }} className="text-lg">❌</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xl font-extrabold text-amber-900">{player.name}</p>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="text-sm text-amber-500 hover:text-amber-700"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-orange-50 p-3 text-center">
              <div className="text-xs font-bold text-orange-400">세션</div>
              <div className="text-xl font-extrabold text-orange-700">{player.totalSessions}</div>
            </div>
            <div className="rounded-2xl bg-yellow-50 p-3 text-center">
              <div className="text-xs font-bold text-yellow-500">별</div>
              <div className="text-xl font-extrabold text-yellow-700">{player.totalStars} ⭐</div>
            </div>
            <div className="rounded-2xl bg-green-50 p-3 text-center">
              <div className="text-xs font-bold text-green-400">레벨</div>
              <div className="text-xl font-extrabold text-green-700">{currentLevel.level}</div>
            </div>
          </div>

          {/* 다음 레벨 프로그레스 */}
          {nextLevel && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-amber-600">
                <span>다음: Lv.{nextLevel.level} {nextLevel.name} {nextLevel.icon}</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-amber-500">
                세션 {player.totalSessions}/{nextLevel.requiredSessions} · 별 {player.totalStars}/{nextLevel.requiredStars}
              </p>
            </div>
          )}
        </div>

        {/* 뱃지 컬렉션 */}
        <div className="mb-6 w-full max-w-md rounded-3xl bg-white p-5 shadow-lg">
          <h2 className="mb-3 text-lg font-extrabold text-amber-900">🏅 뱃지 컬렉션</h2>
          {player.badges.length === 0 ? (
            <p className="text-center text-sm text-amber-500/70 py-2">아직 획득한 뱃지가 없어요. 읽기를 시작해보세요!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {player.badges.map((b) => {
                const def = badgeDefs.find((d) => d.id === b.id)
                if (!def) return null
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800"
                    title={def.description}
                  >
                    <span>{def.icon}</span>
                    <span>{def.name}</span>
                  </div>
                )
              })}
            </div>
          )}
          <p className="mt-2 text-right text-xs text-amber-400">{player.badges.length}/{badgeDefs.length} 획득</p>
        </div>

        {/* 오늘의 흐름 */}
        <div className="mb-8 w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-extrabold text-amber-900">📋 오늘의 읽기 흐름</h2>
          <div className="space-y-3">
            {[
              { emoji: '📖', text: '지문 선택하기', color: 'bg-sky-50 text-sky-700' },
              { emoji: '🎯', text: '목표와 자신감 설정', color: 'bg-orange-50 text-orange-700' },
              { emoji: '🎤', text: '소리 내어 읽기', color: 'bg-purple-50 text-purple-700' },
              { emoji: '⭐', text: '스스로 평가하기', color: 'bg-yellow-50 text-yellow-700' },
              { emoji: '📊', text: '결과 분석 & 보상', color: 'bg-green-50 text-green-700' },
            ].map((item) => (
              <div key={item.text} className={`flex items-center gap-3 rounded-2xl ${item.color} px-4 py-3`}>
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-bold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/passage"
            className="rounded-full bg-orange-500 px-10 py-4 text-lg font-extrabold text-white shadow-lg shadow-orange-200 transition hover:scale-105 hover:bg-orange-600 hover:shadow-xl"
          >
            🚀 탐험 시작하기!
          </Link>
          <Link
            to="/teacher"
            className="text-sm font-bold text-amber-600 transition hover:text-amber-800"
          >
            👩‍🏫 교사 대시보드로 이동
          </Link>
        </div>
      </div>
    </main>
  )
}
