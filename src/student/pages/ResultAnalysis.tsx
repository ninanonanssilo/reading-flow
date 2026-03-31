import { useEffect, useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { analyzeReading } from '../../utils/basa'
import { passages } from '../../data/passages'
import MetricCard from '../components/MetricCard'
import StudentLayout from '../components/StudentLayout'

const reclassifyOptions = [
  { value: 'substitution', label: '대치' },
  { value: 'omission', label: '생략' },
  { value: 'addition', label: '첨가' },
  { value: 'repetition', label: '반복' },
  { value: 'selfCorrection', label: '자기교정' },
] as const

export default function ResultAnalysis() {
  const navigate = useNavigate()
  const { draft, applyReclassify, commitSession, setAnalysis } = useFlow()
  const passage = useMemo(
    () => passages.find((item) => item.id === draft.passageId) ?? null,
    [draft.passageId],
  )

  // analysis가 없지만 transcript와 passage가 있으면 직접 계산
  useEffect(() => {
    if (draft.analysis || !passage || !draft.transcript) return
    const startedAt = draft.readingStartedAt ?? Date.now()
    const endedAt = draft.readingEndedAt ?? Date.now()
    const readingTimeSeconds = Math.max(1, (endedAt - startedAt) / 1000)
    const computed = analyzeReading(passage.text, draft.transcript, readingTimeSeconds)
    setAnalysis(computed)
  }, [draft.analysis, draft.transcript, draft.readingStartedAt, draft.readingEndedAt, passage, setAnalysis])

  if (!passage) {
    return <Navigate to="/passage" replace />
  }

  if (!draft.selfAssessment) {
    return <Navigate to="/assess" replace />
  }

  if (!draft.analysis) {
    return (
      <StudentLayout title="분석 중..." subtitle="읽기 결과를 분석하고 있습니다." step="결과 분석">
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-spin">🔄</div>
        </div>
      </StudentLayout>
    )
  }

  const { analysis, selfAssessment } = { analysis: draft.analysis, selfAssessment: draft.selfAssessment }
  const aiRating = Math.max(1, Math.min(5, Math.round(analysis.accuracy / 20)))
  const gap = Math.abs(aiRating - selfAssessment.selfRating)

  const scaffoldMessage =
    analysis.accuracy >= 85
      ? '정확도가 높습니다. 다음에는 더 긴 지문이나 빠른 읽기 목표에 도전해 보세요.'
      : analysis.accuracy >= 60
        ? '읽기 흐름은 유지됐지만 특정 오류가 반복됩니다. 헷갈린 어절을 중심으로 다시 읽어 보세요.'
        : '지금은 쉬운 지문으로 안정감을 먼저 만드는 편이 좋습니다. 천천히 끊어 읽어도 괜찮습니다.'

  const handleComplete = () => {
    const result = commitSession()
    navigate('/complete', { state: result })
  }

  return (
    <StudentLayout
      title="읽기 결과를 비교해 봐요"
      subtitle="BASA 오류 분석과 자기평가를 나란히 보며 메타인지 정확성을 확인합니다."
      step="screen3"
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="정확도" value={`${analysis.accuracy}%`} />
            <MetricCard label="CWPM" value={`${analysis.cwpm}`} tone="green" />
            <MetricCard label="읽기 시간" value={`${analysis.readingTime}초`} tone="orange" />
            <MetricCard label="총 오류 수" value={`${analysis.totalErrors}`} tone="orange" />
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">메타인지 비교</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-500">자기평가</div>
                <div className="mt-2 text-3xl font-black">{selfAssessment.selfRating} / 5</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-500">AI 추정</div>
                <div className="mt-2 text-3xl font-black">{aiRating} / 5</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              차이 값은 <strong>{gap}</strong>입니다. 차이가 작을수록 자신의 수행을 더 정확하게 판단한
              것입니다.
            </p>
            <div className="mt-5 rounded-2xl bg-sky-50 p-5 text-sm leading-6 text-sky-900">
              루미 피드백: {scaffoldMessage}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">BASA 어절 매핑</p>
              <h2 className="mt-1 text-2xl font-black">{passage.title}</h2>
            </div>
            <div className="text-right text-sm text-slate-500">
              <div>대치 {analysis.errorCounts.substitution}</div>
              <div>생략 {analysis.errorCounts.omission}</div>
              <div>첨가 {analysis.errorCounts.addition}</div>
            </div>
          </div>
          <div className="mt-6 max-h-[34rem] space-y-3 overflow-auto pr-2">
            {analysis.errors.mapping.map((item, index) => (
              <div key={`${item.original}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                  <div>
                    <div className="text-xs font-semibold text-slate-400">원문</div>
                    <div className="text-lg font-bold">{item.original}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">전사</div>
                    <div className="text-lg font-bold text-slate-700">{item.recognized || '없음'}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-center text-xs font-bold uppercase text-slate-500">
                      {item.type}
                    </span>
                    {item.type !== 'correct' ? (
                      <select
                        value={item.type}
                        onChange={(event) =>
                          applyReclassify(
                            index,
                            event.target.value as
                              | 'substitution'
                              | 'omission'
                              | 'addition'
                              | 'repetition'
                              | 'selfCorrection',
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                      >
                        {reclassifyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link to="/assess" className="text-sm font-semibold text-slate-500">
              자기평가 수정
            </Link>
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-full bg-slate-900 px-6 py-3 font-bold text-white"
            >
              완료하고 보상 받기
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
