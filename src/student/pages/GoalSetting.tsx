import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { goalOptions } from '../../data/constants'
import { getPreReadingScaffold } from '../../utils/scaffold'
import { useScreenLogger } from '../../hooks/useScreenLogger'
import { useActivityLogger } from '../../hooks/useActivityLogger'
import Lumi from '../components/Lumi'
import StudentLayout from '../components/StudentLayout'

export default function GoalSetting() {
  useScreenLogger('goal_setting')
  const log = useActivityLogger('goal_setting')
  const navigate = useNavigate()
  const { draft, player, setGoal } = useFlow()
  const [goal, setGoalState] = useState(draft.goalType ?? 'accuracy')
  const [confidence, setConfidence] = useState(draft.confidence)

  const confidenceLabels = ['매우 낮음', '낮음', '높음', '매우 높음']

  return (
    <StudentLayout
      title="오늘의 목표를 정해볼까요?"
      subtitle="루미가 제안하는 목표 중 하나를 골라보세요."
    >
      <div className="mb-6 flex justify-center">
        <Lumi
          mood={goal ? getPreReadingScaffold(goal, player.sessions).mood : 'thinking'}
          size="md"
          message={goal ? getPreReadingScaffold(goal, player.sessions).message : '오늘은 무엇에 집중해볼까?'}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {goalOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => { log('goal_select', { goalType: option.type }); setGoalState(option.type) }}
            className={`border-2 p-6 text-left transition hover:shadow-md ${
              goal === option.type
                ? 'border-[var(--primary)] bg-[var(--primary-light)] shadow-md'
                : `border-[var(--border)] bg-white hover:border-[var(--primary)]`
            }`}
          >
            <div className="text-3xl">{option.icon}</div>
            <h3 className="mt-3 text-lg font-extrabold text-[var(--text-main)]">{option.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-sub)]">{option.description}</p>
            {goal === option.type && (
              <div className="mt-3 text-sm font-bold text-[var(--primary)]">✓ 선택됨</div>
            )}
          </button>
        ))}
      </div>

      {/* 자신감 슬라이더 */}
      <div className="mt-8 border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[var(--text-main)]">이 목표를 얼마나 해낼 수 있을까요?</h3>
          <div className="bg-[var(--primary-light)] px-4 py-2 text-lg font-extrabold text-[var(--primary)]">
            {confidence}/4
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="4"
          value={confidence}
          onChange={(e) => { const v = Number(e.target.value); log('confidence_set', { confidence: v }); setConfidence(v) }}
          className="mt-5 w-full accent-[var(--primary)]"
        />
        <div className="mt-2 flex justify-between text-sm font-bold">
          {confidenceLabels.map((label) => (
            <span key={label} className="text-[var(--text-light)]">{label}</span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => {
            log('goal_confirm', { goalType: goal, confidence })
            setGoal(goal, confidence)
            navigate('/reading')
          }}
          className="bg-[var(--primary)] px-8 py-3.5 text-base font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)]"
        >
          읽기 시작하기 →
        </button>
      </div>
    </StudentLayout>
  )
}
