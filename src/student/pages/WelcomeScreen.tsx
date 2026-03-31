import { Link } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { levels } from '../../data/constants'

export default function WelcomeScreen() {
  const { player } = useFlow()
  const currentLevel = levels.find((l) => l.level === player.level) ?? levels[0]

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
        <div className="mb-8 w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
              {currentLevel.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-600">Lv.{currentLevel.level} {currentLevel.name}</p>
              <p className="text-xl font-extrabold text-amber-900">{player.name}</p>
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
