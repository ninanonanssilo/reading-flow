import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import StarRating from '../components/StarRating'
import StudentLayout from '../components/StudentLayout'

export default function SelfAssessment() {
  const navigate = useNavigate()
  const { setSelfAssessment } = useFlow()
  const [selfRating, setSelfRating] = useState(3)
  const [feltDifficulty, setFeltDifficulty] = useState<boolean | null>(null)

  return (
    <StudentLayout
      title="내 읽기를 스스로 평가해요 ⭐"
      subtitle="별점과 난이도 판단을 남기면, AI 분석과 비교할 수 있어요."
    >
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* 별점 */}
        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h3 className="mb-1 text-lg font-extrabold text-amber-900">오늘 나는 얼마나 잘 읽었을까요?</h3>
          <p className="mb-4 text-sm text-amber-600/70">별을 눌러서 평가해보세요</p>
          <div className="flex justify-center">
            <StarRating value={selfRating} onChange={setSelfRating} />
          </div>
        </div>

        {/* 난이도 */}
        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-extrabold text-amber-900">읽기가 어땠나요?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFeltDifficulty(true)}
              className={`rounded-2xl border-3 p-5 text-center transition hover:scale-[1.02] ${
                feltDifficulty === true
                  ? 'border-orange-400 bg-orange-50 shadow-md'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-4xl">😅</div>
              <div className="mt-2 text-base font-extrabold text-amber-900">어려웠어요</div>
              <p className="mt-1 text-xs text-amber-600/60">헷갈리는 부분이 많았어요</p>
            </button>
            <button
              type="button"
              onClick={() => setFeltDifficulty(false)}
              className={`rounded-2xl border-3 p-5 text-center transition hover:scale-[1.02] ${
                feltDifficulty === false
                  ? 'border-green-400 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-4xl">😊</div>
              <div className="mt-2 text-base font-extrabold text-amber-900">괜찮았어요</div>
              <p className="mt-1 text-xs text-amber-600/60">비교적 잘 읽었어요</p>
            </button>
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          type="button"
          disabled={feltDifficulty === null}
          onClick={() => {
            setSelfAssessment({ selfRating, feltDifficulty: feltDifficulty ?? false })
            navigate('/results')
          }}
          className="w-full rounded-full bg-orange-500 px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition hover:scale-105 hover:bg-orange-600 disabled:opacity-40 disabled:hover:scale-100"
        >
          결과 분석 보기 →
        </button>
      </div>
    </StudentLayout>
  )
}
