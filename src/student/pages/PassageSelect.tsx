import { useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { passages } from '../../data/passages'
import StudentLayout from '../components/StudentLayout'

const difficultyStyle = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-400',
  medium: 'bg-amber-50 text-amber-700 border-amber-400',
  hard: 'bg-red-50 text-red-700 border-red-400',
}

const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }

export default function PassageSelect() {
  const navigate = useNavigate()
  const { draft, setPassage } = useFlow()

  return (
    <StudentLayout
      title="어떤 이야기를 읽어볼까요?"
      subtitle="마음에 드는 지문을 골라보세요. 난이도를 확인하고 도전해봐요!"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {passages.map((passage) => {
          const selected = draft.passageId === passage.id
          return (
            <button
              key={passage.id}
              type="button"
              onClick={() => setPassage(passage.id)}
              className={`border-2 p-5 text-left transition hover:shadow-md ${
                selected
                  ? 'border-[var(--primary)] bg-[var(--primary-light)] shadow-md'
                  : 'border-[var(--border)] bg-white hover:border-[var(--primary)]'
              }`}
            >
              <div className="mb-3 text-4xl">{passage.thumbnailEmoji}</div>
              <h3 className="text-lg font-extrabold text-[var(--text-main)]">{passage.title}</h3>
              <span className={`mt-2 inline-block border-l-4 px-2 py-0.5 text-xs font-bold ${difficultyStyle[passage.difficulty]}`}>
                {difficultyLabel[passage.difficulty]}
              </span>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--text-sub)]">
                {passage.text}
              </p>
              {selected && (
                <div className="mt-3 text-sm font-bold text-[var(--primary)]">✓ 선택됨</div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!draft.passageId}
          onClick={() => navigate('/goal')}
          className="bg-[var(--primary)] px-8 py-3.5 text-base font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)] disabled:opacity-40"
        >
          목표 설정하러 가기 →
        </button>
      </div>
    </StudentLayout>
  )
}
