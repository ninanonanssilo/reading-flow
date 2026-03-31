import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFlow } from '../../context/FlowContext'
import { badges as badgeDefs, levels } from '../../data/constants'

export default function WelcomeScreen() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { player, setName } = useFlow()
  const currentLevel = levels.find((l) => l.level === player.level) ?? levels[0]
  const nextLevel = levels.find((l) => l.level === player.level + 1)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)

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

  const sessionsProgress = nextLevel
    ? Math.min(100, (player.totalSessions / nextLevel.requiredSessions) * 100)
    : 100
  const starsProgress = nextLevel
    ? Math.min(100, (player.totalStars / nextLevel.requiredStars) * 100)
    : 100
  const overallProgress = Math.min(sessionsProgress, starsProgress)

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      {/* 헤더 */}
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-5">
        <Link
          to="/teacher"
          className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-sub)] shadow-sm transition hover:shadow-md"
        >
          👩‍🏫 교사용
        </Link>
        <div className="flex items-center gap-2">
          {user && <span className="text-sm font-bold text-[var(--text-sub)]">{user.username}</span>}
          <button
            type="button"
            onClick={() => { logout(); navigate('/login') }}
            className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-light)] shadow-sm transition hover:text-red-500 hover:shadow-md"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-60px)] max-w-4xl flex-col items-center justify-center px-6 py-10">
        {/* 타이틀 */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-6xl">📚</div>
          <h1 className="text-4xl font-extrabold text-[var(--text-main)] md:text-5xl">
            읽기 우주탐험대
          </h1>
          <p className="mt-3 text-lg text-[var(--text-sub)]">
            루미와 함께 읽기 실력을 키워보아요!
          </p>
        </div>

        {/* 플레이어 정보 카드 */}
        <div className="mb-5 w-full max-w-md border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center bg-[var(--primary-light)] text-2xl">
              {currentLevel.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[var(--primary)]">Lv.{currentLevel.level} {currentLevel.name}</p>
              {editingName ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    maxLength={12}
                    className="w-full border-2 border-[var(--primary)] bg-[var(--primary-light)] px-3 py-1.5 text-base font-bold text-[var(--text-main)] outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={handleNameSave} className="text-sm font-bold text-[var(--primary)]">저장</button>
                  <button type="button" onClick={() => { setEditingName(false); setNameInput(player.name) }} className="text-sm font-bold text-[var(--text-light)]">취소</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xl font-extrabold text-[var(--text-main)]">{player.name}</p>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="text-xs font-bold text-[var(--text-light)] hover:text-[var(--primary)]"
                  >
                    [수정]
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-main)] p-3 text-center">
              <div className="text-[10px] font-bold text-[var(--text-light)]">세션</div>
              <div className="text-xl font-extrabold text-[var(--text-main)]">{player.totalSessions}</div>
            </div>
            <div className="bg-[var(--bg-main)] p-3 text-center">
              <div className="text-[10px] font-bold text-[var(--text-light)]">별</div>
              <div className="text-xl font-extrabold text-[var(--accent-yellow)]">{player.totalStars} ⭐</div>
            </div>
            <div className="bg-[var(--bg-main)] p-3 text-center">
              <div className="text-[10px] font-bold text-[var(--text-light)]">레벨</div>
              <div className="text-xl font-extrabold text-[var(--primary)]">{currentLevel.level}</div>
            </div>
          </div>

          {nextLevel && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-sub)]">
                <span>다음: Lv.{nextLevel.level} {nextLevel.name} {nextLevel.icon}</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden bg-[var(--bg-main)]">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--text-light)]">
                세션 {player.totalSessions}/{nextLevel.requiredSessions} · 별 {player.totalStars}/{nextLevel.requiredStars}
              </p>
            </div>
          )}
        </div>

        {/* 뱃지 컬렉션 */}
        <div className="mb-5 w-full max-w-md border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-[var(--text-main)]">🏅 뱃지 컬렉션</h2>
            <span className="text-xs font-bold text-[var(--text-light)]">{player.badges.length}/{badgeDefs.length}</span>
          </div>
          {player.badges.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-light)] py-2">아직 획득한 뱃지가 없어요. 읽기를 시작해보세요!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {player.badges.map((b) => {
                const def = badgeDefs.find((d) => d.id === b.id)
                if (!def) return null
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-1.5 border border-[var(--border)] bg-[var(--bg-main)] px-3 py-1.5 text-sm font-bold text-[var(--text-main)]"
                    title={def.description}
                  >
                    <span>{def.icon}</span>
                    <span>{def.name}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 오늘의 흐름 */}
        <div className="mb-8 w-full max-w-md border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-[var(--text-main)]">📋 오늘의 읽기 흐름</h2>
          <div className="space-y-2">
            {[
              { num: '01', text: '지문 선택하기', color: 'border-l-[var(--primary)]' },
              { num: '02', text: '목표와 자신감 설정', color: 'border-l-[var(--accent-orange)]' },
              { num: '03', text: '소리 내어 읽기', color: 'border-l-[var(--accent-purple)]' },
              { num: '04', text: '스스로 평가하기', color: 'border-l-[var(--accent-yellow)]' },
              { num: '05', text: '결과 분석 & 보상', color: 'border-l-[var(--secondary)]' },
            ].map((item) => (
              <div key={item.text} className={`flex items-center gap-3 border-l-4 ${item.color} bg-[var(--bg-main)] px-4 py-3`}>
                <span className="text-xs font-extrabold text-[var(--text-light)]">{item.num}</span>
                <span className="text-sm font-bold text-[var(--text-main)]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/passage"
            className="bg-[var(--primary)] px-10 py-4 text-lg font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)] hover:shadow-lg"
          >
            탐험 시작하기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
