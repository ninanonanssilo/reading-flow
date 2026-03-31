import { useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { passages } from '../../data/passages'
import StudentLayout from '../components/StudentLayout'

const difficultyStyle = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
}

const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }

export default function PassageSelect() {
  const navigate = useNavigate()
  const { draft, setPassage } = useFlow()

  return (
    <StudentLayout
      title="어떤 이야기를 읽어볼까요? 📖"
      subtitle="마음에 드는 지문을 골라보세요. 난이도를 확인하고 도전해봐요!"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {passages.map((passage) => {
          const selected = draft.passageId === passage.id
          return (
            <button
              key={passage.id}
              type="button"
              onClick={() => setPassage(passage.id)}
              className={`rounded-3xl border-3 p-5 text-left transition hover:scale-[1.02] hover:shadow-lg ${
                selected
                  ? 'border-orange-400 bg-orange-50 shadow-lg shadow-orange-100 ring-2 ring-orange-200'
                  : 'border-transparent bg-white shadow-md hover:border-orange-200'
              }`}
            >
              <div className="mb-3 text-5xl">{passage.thumbnailEmoji}</div>
              <h3 className="text-xl font-extrabold text-amber-900">{passage.title}</h3>
              <span className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-bold ${difficultyStyle[passage.difficulty]}`}>
                {difficultyLabel[passage.difficulty]}
              </span>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-amber-700/70">
                {passage.text}
              </p>
              {selected && (
                <div className="mt-3 text-sm font-bold text-orange-500">✅ 선택됨</div>
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
          className="rounded-full bg-orange-500 px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition hover:scale-105 hover:bg-orange-600 disabled:opacity-40 disabled:hover:scale-100"
        >
          목표 설정하러 가기 →
        </button>
      </div>
    </StudentLayout>
  )
}
