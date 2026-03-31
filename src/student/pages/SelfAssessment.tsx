import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import Lumi from '../components/Lumi'
import StarRating from '../components/StarRating'
import StudentLayout from '../components/StudentLayout'

export default function SelfAssessment() {
  const navigate = useNavigate()
  const { setSelfAssessment } = useFlow()
  const [selfRating, setSelfRating] = useState(3)
  const [feltDifficulty, setFeltDifficulty] = useState<boolean | null>(null)

  return (
    <StudentLayout
      title="내 읽기를 스스로 평가해요"
      subtitle="별점과 난이도 판단을 남기면, AI 분석과 비교할 수 있어요."
    >
      <div className="mx-auto w-full max-w-lg space-y-5">
        {/* 루미 */}
        <div className="flex justify-center">
          <Lumi mood="thinking" size="md" message="스스로 생각해봐. 얼마나 잘 읽었을까?" />
        </div>

        {/* 별점 */}
        <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-extrabold text-[var(--text-main)]">오늘 나는 얼마나 잘 읽었을까요?</h3>
          <p className="mb-4 text-sm text-[var(--text-light)]">별을 눌러서 평가해보세요</p>
          <div className="flex justify-center">
            <StarRating value={selfRating} onChange={setSelfRating} />
          </div>
        </div>

        {/* 난이도 */}
        <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-extrabold text-[var(--text-main)]">읽기가 어땠나요?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFeltDifficulty(true)}
              className={`border-2 p-5 text-center transition hover:shadow-sm ${
                feltDifficulty === true
                  ? 'border-[var(--accent-orange)] bg-[var(--accent-orange-light)]'
                  : 'border-[var(--border)] bg-[var(--bg-main)]'
              }`}
            >
              <div className="text-3xl">😅</div>
              <div className="mt-2 text-base font-extrabold text-[var(--text-main)]">어려웠어요</div>
              <p className="mt-1 text-xs text-[var(--text-light)]">헷갈리는 부분이 많았어요</p>
            </button>
            <button
              type="button"
              onClick={() => setFeltDifficulty(false)}
              className={`border-2 p-5 text-center transition hover:shadow-sm ${
                feltDifficulty === false
                  ? 'border-[var(--secondary)] bg-[var(--secondary-light)]'
                  : 'border-[var(--border)] bg-[var(--bg-main)]'
              }`}
            >
              <div className="text-3xl">😊</div>
              <div className="mt-2 text-base font-extrabold text-[var(--text-main)]">괜찮았어요</div>
              <p className="mt-1 text-xs text-[var(--text-light)]">비교적 잘 읽었어요</p>
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
          className="w-full bg-[var(--primary)] px-8 py-4 text-base font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)] disabled:opacity-40"
        >
          결과 분석 보기 →
        </button>
      </div>
    </StudentLayout>
  )
}
