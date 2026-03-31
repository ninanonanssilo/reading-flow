import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { goalOptions } from '../../data/constants'
import StudentLayout from '../components/StudentLayout'

const goalColors = ['bg-sky-50 border-sky-300', 'bg-orange-50 border-orange-300', 'bg-purple-50 border-purple-300']

export default function GoalSetting() {
  const navigate = useNavigate()
  const { draft, setGoal } = useFlow()
  const [goal, setGoalState] = useState(draft.goalType ?? 'accuracy')
  const [confidence, setConfidence] = useState(draft.confidence)

  const confidenceLabels = ['매우 낮아요 😣', '낮아요 😐', '높아요 😊', '매우 높아요 🤩']

  return (
    <StudentLayout
      title="오늘의 목표를 정해볼까요? 🎯"
      subtitle="루미가 제안하는 목표 중 하나를 골라보세요."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {goalOptions.map((option, i) => (
          <button
            key={option.type}
            type="button"
            onClick={() => setGoalState(option.type)}
            className={`rounded-3xl border-3 p-6 text-left transition hover:scale-[1.02] ${
              goal === option.type
                ? 'border-orange-400 bg-orange-50 shadow-lg shadow-orange-100 ring-2 ring-orange-200'
                : `${goalColors[i]} border-2 shadow-md`
            }`}
          >
            <div className="text-4xl">{option.icon}</div>
            <h3 className="mt-3 text-xl font-extrabold text-amber-900">{option.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-amber-700/70">{option.description}</p>
            {goal === option.type && (
              <div className="mt-3 text-sm font-bold text-orange-500">✅ 선택됨</div>
            )}
          </button>
        ))}
      </div>

      {/* 자신감 슬라이더 */}
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-amber-900">이 목표를 얼마나 해낼 수 있을까요?</h3>
          <div className="rounded-full bg-orange-100 px-4 py-2 text-lg font-extrabold text-orange-600">
            {confidence}/4
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="4"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="mt-5 w-full accent-orange-500"
        />
        <div className="mt-2 flex justify-between text-sm font-bold">
          {confidenceLabels.map((label) => (
            <span key={label} className="text-amber-600/60">{label}</span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setGoal(goal, confidence)
            navigate('/reading')
          }}
          className="rounded-full bg-orange-500 px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition hover:scale-105 hover:bg-orange-600"
        >
          읽기 시작하기 →
        </button>
      </div>
    </StudentLayout>
  )
}
