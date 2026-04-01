import { useMemo, useState } from 'react'
import { saveReclassification } from '../../lib/api'
import type { SessionData } from '../../types'
import { applyReclassifications, type Reclassification } from '../../utils/reclassification'
import { determineHHAIRLevel } from '../../utils/scaffold'
import WordMappingEditor from './WordMappingEditor'
import ReclassificationSummary from './ReclassificationSummary'

type DetailTab = 'overview' | 'sessions' | 'reclassify'
const tabDefs: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'reclassify', label: 'Reclassify' },
]
interface Props { student: { name: string; [key: string]: unknown }; sessions: SessionData[]; teacherId: string; onClose?: () => void }
export default function StudentDetailPanel({ student, sessions, teacherId, onClose }: Props) {
  const [tab, setTab] = useState<DetailTab>('overview')
  const [si, setSi] = useState(Math.max(0, sessions.length - 1))
  const [recls, setRecls] = useState<Reclassification[]>([])
  const ss = sessions[si] ?? null
  const adj = useMemo(() => { if (!ss || recls.length === 0) return null; return applyReclassifications(ss.analysis, recls) }, [ss, recls])
  const addR = (r: Reclassification) => { setRecls((p) => [...p.filter((x) => x.wordIndex !== r.wordIndex), r]); saveReclassification({ sessionId: String(si), wordIndex: r.wordIndex, originalType: r.originalType, reclassifiedType: r.reclassifiedType, teacherId }).catch(() => {}) }
  const st = useMemo(() => {
    if (sessions.length === 0) return null
    const aa = sessions.map((s) => s.analysis.accuracy)
    const cc = sessions.map((s) => s.analysis.cwpm)
    const h = sessions.length >= 3 ? determineHHAIRLevel(sessions, sessions[sessions.length-1].analysis.accuracy) : 'ai-adjusted' as const
    return { n: sessions.length, a: (aa.reduce((x,y)=>x+y,0)/aa.length).toFixed(1), c: (cc.reduce((x,y)=>x+y,0)/cc.length).toFixed(1), h }
  }, [sessions])
  const tabClass = (k: DetailTab) => 'px-4 py-2 text-sm font-bold ' + (tab === k ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500')
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-800">{student.name} 상세 분석</h2>
        {onClose && <button type="button" onClick={onClose} className="text-sm font-bold text-gray-400">닫기 X</button>}
      </div>
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {tabDefs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={tabClass(t.key)}>{t.label}</button>
        ))}
      </div>
      {tab === 'overview' && st && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="border border-gray-200 bg-white p-4 text-center"><p className="text-[10px] font-bold text-gray-500">총 세션</p><p className="mt-1 text-2xl font-extrabold text-gray-700">{st.n}</p></div>
          <div className="border border-gray-200 bg-white p-4 text-center"><p className="text-[10px] font-bold text-gray-500">평균 정확도</p><p className="mt-1 text-2xl font-extrabold text-blue-600">{st.a}%</p></div>
          <div className="border border-gray-200 bg-white p-4 text-center"><p className="text-[10px] font-bold text-gray-500">평균 CWPM</p><p className="mt-1 text-2xl font-extrabold text-orange-600">{st.c}</p></div>
          <div className="border border-gray-200 bg-white p-4 text-center"><p className="text-[10px] font-bold text-gray-500">HHAIR</p><p className="mt-1 text-sm font-extrabold">{st.h}</p></div>
        </div>
      )}
      {tab === 'sessions' && (
        <div className="overflow-auto"><table className="min-w-full text-sm"><thead><tr className="border-b-2 border-gray-200 text-left text-gray-500"><th className="pb-2">No</th><th className="pb-2">지문</th><th className="pb-2">정확도</th><th className="pb-2">CWPM</th><th className="pb-2">목표</th><th className="pb-2">자기평가</th></tr></thead><tbody>{sessions.map((s, i) => (<tr key={i} className="border-t border-gray-100"><td className="py-2">{i + 1}</td><td className="py-2">{s.passageId}</td><td className="py-2 font-bold">{s.analysis.accuracy.toFixed(1)}%</td><td className="py-2">{s.analysis.cwpm.toFixed(1)}</td><td className="py-2">{s.goalType}</td><td className="py-2">{s.selfAssessment.selfRating}/5</td></tr>))}</tbody></table></div>
      )}
      {tab === 'reclassify' && (
        <div className="space-y-4">
          {sessions.length > 0 ? (<>
            <select value={si} onChange={(e) => { setSi(Number(e.target.value)); setRecls([]) }} className="w-full border border-gray-200 p-2 text-sm">{sessions.map((s, i) => (<option key={i} value={i}>{i+1}회 - {s.passageId} ({s.analysis.accuracy.toFixed(1)}%)</option>))}</select>
            {ss && ss.analysis.errors.mapping.length > 0 && (<WordMappingEditor mappings={ss.analysis.errors.mapping} existingReclassifications={recls} teacherId={teacherId} sessionId={String(si)} onReclassify={addR} />)}
            {adj && (<div className="grid grid-cols-2 gap-3"><div className="border border-gray-200 bg-gray-50 p-3 text-center"><p className="text-[10px] font-bold text-gray-500">AI 원본</p><p className="mt-1 text-lg font-extrabold text-gray-700">{ss!.analysis.accuracy.toFixed(1)}%</p></div><div className="border border-emerald-200 bg-emerald-50 p-3 text-center"><p className="text-[10px] font-bold text-emerald-600">교사 교정 후</p><p className="mt-1 text-lg font-extrabold text-emerald-700">{adj.adjustedAccuracy.toFixed(1)}%</p></div></div>)}
            <ReclassificationSummary reclassifications={recls} totalWords={ss?.analysis.errors.mapping.length ?? 0} />
          </>) : <p className="text-center text-sm text-gray-500">세션 데이터가 없습니다.</p>}
        </div>
      )}
    </div>
  )
}
