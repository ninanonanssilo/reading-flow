import { useEffect, useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { analyzeReading } from '../../utils/basa'
import { passages } from '../../data/passages'
import { generateScaffold, getMetacognitionFeedback } from '../../utils/scaffold'
import Lumi from '../components/Lumi'
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
  const { draft, player, applyReclassify, commitSession, setAnalysis } = useFlow()
  const passage = useMemo(
    () => passages.find((item) => item.id === draft.passageId) ?? null,
    [draft.passageId],
  )

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
          <div className="text-4xl animate-spin">⏳</div>
        </div>
      </StudentLayout>
    )
  }

  const { analysis, selfAssessment } = { analysis: draft.analysis, selfAssessment: draft.selfAssessment }
  const aiRating = Math.max(1, Math.min(5, Math.round(analysis.accuracy / 20)))
  const gap = Math.abs(aiRating - selfAssessment.selfRating)

  const scaffold = generateScaffold(analysis, draft.goalType ?? 'accuracy', selfAssessment.selfRating, player.sessions)
  const metacognition = getMetacognitionFeedback(gap, selfAssessment.selfRating, aiRating)

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
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="정확도" value={`${analysis.accuracy}%`} />
            <MetricCard label="CWPM" value={`${analysis.cwpm}`} tone="green" />
            <MetricCard label="읽기 시간" value={`${analysis.readingTime}초`} tone="orange" />
            <MetricCard label="총 오류 수" value={`${analysis.totalErrors}`} tone="orange" />
          </div>

          <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[var(--text-light)]">메타인지 비교</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="bg-[var(--bg-main)] p-5">
                <div className="text-sm font-bold text-[var(--text-light)]">자기평가</div>
                <div className="mt-2 text-3xl font-extrabold text-[var(--text-main)]">{selfAssessment.selfRating} / 5</div>
              </div>
              <div className="bg-[var(--bg-main)] p-5">
                <div className="text-sm font-bold text-[var(--text-light)]">AI 추정</div>
                <div className="mt-2 text-3xl font-extrabold text-[var(--text-main)]">{aiRating} / 5</div>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Lumi mood={metacognition.mood} size="sm" showBubble={false} />
              <p className="text-sm leading-6 text-[var(--text-sub)]">
                {metacognition.message} (차이: <strong>{gap}</strong>)
              </p>
            </div>
          </div>

          {/* 적응적 스캐폴딩 */}
          <div className="flex gap-4 items-start border border-[var(--border)] bg-white p-5 shadow-sm">
            <Lumi mood={scaffold.mood} size="sm" showBubble={false} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-white bg-[var(--primary)] px-2 py-0.5">
                  {scaffold.scaffoldType === 'directive' ? 'AI 안내'
                    : scaffold.scaffoldType === 'suggestive' ? '루미 제안'
                    : scaffold.scaffoldType === 'reflective' ? '생각해보기'
                    : '응원'}
                </span>
                <span className="text-xs text-[var(--text-light)]">
                  {scaffold.hhairLevel === 'ai-adjusted' ? 'AI 조절'
                    : scaffold.hhairLevel === 'co-regulated' ? '공동 조절'
                    : scaffold.hhairLevel === 'shared-regulated' ? '공유 조절'
                    : '자기 조절'}
                </span>
              </div>
              <p className="text-sm font-bold leading-relaxed text-[var(--text-main)]">
                {scaffold.message}
              </p>
              {scaffold.hint && (
                <p className="mt-2 text-sm text-[var(--primary)] bg-[var(--primary-light)] px-3 py-2">
                  {scaffold.hint}
                </p>
              )}
              {scaffold.suggestedAction && (
                <p className="mt-2 text-xs font-bold text-[var(--primary)]">
                  {scaffold.suggestedAction}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--text-light)]">BASA 어절 매핑</p>
              <h2 className="mt-1 text-2xl font-extrabold text-[var(--text-main)]">{passage.title}</h2>
            </div>
            <div className="text-right text-sm text-[var(--text-light)]">
              <div>대치 {analysis.errorCounts.substitution}</div>
              <div>생략 {analysis.errorCounts.omission}</div>
              <div>첨가 {analysis.errorCounts.addition}</div>
            </div>
          </div>
          <div className="mt-6 max-h-[34rem] space-y-3 overflow-auto pr-2">
            {analysis.errors.mapping.map((item, index) => (
              <div key={`${item.original}-${index}`} className="border border-[var(--border)] bg-[var(--bg-main)] p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                  <div>
                    <div className="text-xs font-bold text-[var(--text-light)]">원문</div>
                    <div className="text-lg font-bold text-[var(--text-main)]">{item.original}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-light)]">전사</div>
                    <div className="text-lg font-bold text-[var(--text-sub)]">{item.recognized || '없음'}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="bg-white border border-[var(--border)] px-3 py-1 text-center text-xs font-bold uppercase text-[var(--text-light)]">
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
                        className="border border-[var(--border)] bg-white px-3 py-2 text-xs font-bold"
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
            <Link to="/assess" className="text-sm font-bold text-[var(--text-light)] hover:text-[var(--primary)]">
              자기평가 수정
            </Link>
            <button
              type="button"
              onClick={handleComplete}
              className="bg-[var(--text-main)] px-6 py-3 font-bold text-white transition hover:opacity-90"
            >
              완료하고 보상 받기
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
