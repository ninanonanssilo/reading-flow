import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'

const SUGGESTIONS = ['우주 탐험가', '별빛 독서왕', '달빛 모험가', '은하수 여행자', '하늘 위 독서가']

export default function NicknameSetup() {
  const navigate = useNavigate()
  const { setName } = useFlow()
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    const name = input.trim()
    if (!name) return
    setName(name)
    navigate('/')
  }

  return (
    <main className="min-h-screen bg-[#FFF9F0]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute bottom-10 -left-10 h-48 w-48 rounded-full bg-yellow-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 text-7xl animate-float">🚀</div>
          <h1 className="text-3xl font-extrabold text-amber-900">반가워요!</h1>
          <p className="mt-3 text-base text-amber-700/80">
            읽기 우주탐험대에서 사용할<br />닉네임을 정해주세요.
          </p>
        </div>

        <div className="w-full space-y-5">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <label className="mb-2 block text-sm font-bold text-amber-700">닉네임</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="닉네임을 입력하세요"
              maxLength={12}
              className="w-full rounded-2xl border-2 border-orange-200 bg-orange-50/50 px-4 py-3.5 text-lg font-bold text-amber-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-amber-400/50"
              autoFocus
            />
            <p className="mt-2 text-right text-xs text-amber-500">{input.length}/12</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-md">
            <p className="mb-3 text-sm font-bold text-amber-700">추천 닉네임</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition hover:scale-105 ${
                    input === s
                      ? 'border-orange-400 bg-orange-100 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-amber-700 hover:border-orange-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!input.trim()}
            onClick={handleSubmit}
            className="w-full rounded-full bg-orange-500 py-4 text-lg font-extrabold text-white shadow-lg shadow-orange-200 transition hover:scale-105 hover:bg-orange-600 disabled:opacity-40 disabled:hover:scale-100"
          >
            시작하기!
          </button>
        </div>
      </div>
    </main>
  )
}
