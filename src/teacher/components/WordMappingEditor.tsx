import { useState } from 'react'
import type { WordMapping, ErrorType } from '../../types'
import type { Reclassification } from '../../utils/reclassification'

interface Props {
  mappings: WordMapping[]
  existingReclassifications: Reclassification[]
  teacherId: string
  sessionId: string
  onReclassify: (reclassification: Reclassification) => void
}

const errorTypeLabels: Record<ErrorType, { label: string; color: string; bg: string }> = {
  correct: { label: '정확', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  substitution: { label: '대치', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  omission: { label: '생략', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  addition: { label: '첨가', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  repetition: { label: '반복', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  selfCorrection: { label: '자기교정', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
}

const allTypes: ErrorType[] = ['correct', 'substitution', 'omission', 'addition', 'repetition', 'selfCorrection']

export default function WordMappingEditor({ mappings, existingReclassifications, teacherId, onReclassify }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const getCurrentType = (idx: number): { type: ErrorType; source: 'ai' | 'teacher' } => {
    const reclass = existingReclassifications
      .filter((r) => r.wordIndex === idx)
      .sort((a, b) => b.reclassifiedAt - a.reclassifiedAt)[0]
    if (reclass) return { type: reclass.reclassifiedType, source: 'teacher' }
    return { type: mappings[idx].type, source: 'ai' }
  }

  const handleReclassify = (idx: number, newType: ErrorType) => {
    const original = mappings[idx]
    onReclassify({
      wordIndex: idx,
      originalType: original.type,
      reclassifiedType: newType,
      reclassifiedBy: teacherId,
      reclassifiedAt: Date.now(),
    })
    setEditingIndex(null)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700">어절별 오류 분류</h4>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 bg-gray-300" /> AI 분류</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 bg-yellow-400" /> 교사 교정</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {mappings.map((mapping, idx) => {
          const current = getCurrentType(idx)
          const style = errorTypeLabels[current.type]
          const isEditing = editingIndex === idx
          const wasReclassified = current.source === 'teacher'
          return (
            <div key={idx} className="relative">
              <button
                type="button"
                onClick={() => setEditingIndex(isEditing ? null : idx)}
                className={`relative border px-2 py-1 text-xs font-bold transition ${style.bg} ${style.color} ${isEditing ? 'ring-2 ring-blue-400' : ''}`}
                title={`원문: ${mapping.original} | 인식: ${mapping.recognized} | ${style.label}${wasReclassified ? ' (교사)' : ' (AI)'}`}
              >
                {mapping.original}
                {wasReclassified && <span className="absolute -right-1 -top-1 h-2 w-2 bg-yellow-400 ring-1 ring-white" />}
              </button>
              {isEditing && (
                <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="text-[10px] text-gray-500">원문: <strong>{mapping.original}</strong></p>
                    <p className="text-[10px] text-gray-500">인식: <strong>{mapping.recognized || '(없음)'}</strong></p>
                    <p className="text-[10px] text-gray-500">AI: <strong>{errorTypeLabels[mapping.type].label}</strong></p>
                  </div>
                  {allTypes.map((type) => {
                    const ts = errorTypeLabels[type]
                    const isCurrent = current.type === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleReclassify(idx, type)}
                        disabled={isCurrent}
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition hover:bg-gray-50 ${isCurrent ? 'bg-gray-100 font-bold' : ''} ${ts.color}`}
                      >
                        <span className={`h-2 w-2 ${ts.bg} border`} />
                        {ts.label}
                        {isCurrent && <span className="ml-auto text-gray-400">현재</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
