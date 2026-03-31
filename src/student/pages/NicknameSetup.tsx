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
    <main className="min-h-screen bg-[var(--bg-main)]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 text-center animate-slide-up">
          <div className="mb-4 text-6xl">📚</div>
          <h1 className="text-3xl font-extrabold text-[var(--text-main)]">반가워요!</h1>
          <p className="mt-3 text-base text-[var(--text-sub)]">
            읽기 우주탐험대에서 사용할<br />닉네임을 정해주세요.
          </p>
        </div>

        <div className="w-full space-y-5">
          <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-[var(--text-sub)]">닉네임</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="닉네임을 입력하세요"
              maxLength={12}
              className="w-full border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3.5 text-lg font-bold text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] placeholder:text-[var(--text-light)]"
              autoFocus
            />
            <p className="mt-2 text-right text-xs text-[var(--text-light)]">{input.length}/12</p>
          </div>

          <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-[var(--text-sub)]">추천 닉네임</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className={`border-2 px-4 py-2 text-sm font-bold transition hover:shadow-sm ${
                    input === s
                      ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-sub)] hover:border-[var(--primary)]'
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
            className="w-full bg-[var(--primary)] py-4 text-lg font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)] disabled:opacity-40"
          >
            시작하기
          </button>
        </div>
      </div>
    </main>
  )
}
