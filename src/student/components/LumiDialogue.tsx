import { useCallback, useEffect, useState } from 'react'
import Lumi from './Lumi'
import type { LumiMood } from '../../data/lumiMessages'

export interface DialogueChoice {
  label: string
  value: string
  nextDialogue?: string
}

export interface DialogueLine {
  id: string
  text: string
  mood: LumiMood
  choices?: DialogueChoice[]
  autoAdvance?: number
}

interface Props {
  lines: DialogueLine[]
  onComplete: (selectedChoices: Record<string, string>) => void
  onChoice?: (lineId: string, value: string) => void
  playerName?: string
}

export default function LumiDialogue({ lines, onComplete, onChoice, playerName }: Props) {
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [showChoices, setShowChoices] = useState(false)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [isTyping, setIsTyping] = useState(true)

  const current = lines[lineIdx]
  if (!current) return null

  const displayText = current.text
    .replace('{name}', playerName ?? '탐험가')
  const visibleText = displayText.slice(0, charIdx)
  const typingDone = charIdx >= displayText.length

  useEffect(() => {
    setCharIdx(0)
    setShowChoices(false)
    setIsTyping(true)
  }, [lineIdx])

  useEffect(() => {
    if (charIdx >= displayText.length) {
      setIsTyping(false)
      if (current.choices && current.choices.length > 0) {
        const timer = setTimeout(() => setShowChoices(true), 200)
        return () => clearTimeout(timer)
      }
      if (current.autoAdvance) {
        const timer = setTimeout(() => advance(), current.autoAdvance)
        return () => clearTimeout(timer)
      }
      return
    }
    const speed = 35
    const timer = setTimeout(() => setCharIdx((c) => c + 1), speed)
    return () => clearTimeout(timer)
  }, [charIdx, displayText.length])

  const advance = useCallback(() => {
    if (lineIdx < lines.length - 1) {
      setLineIdx((i) => i + 1)
    } else {
      onComplete(selections)
    }
  }, [lineIdx, lines.length, onComplete, selections])

  const handleTap = () => {
    if (isTyping) {
      setCharIdx(displayText.length)
      return
    }
    if (current.choices && current.choices.length > 0) return
    advance()
  }

  const handleChoice = (choice: DialogueChoice) => {
    const next = { ...selections, [current.id]: choice.value }
    setSelections(next)
    onChoice?.(current.id, choice.value)

    if (choice.nextDialogue) {
      const targetIdx = lines.findIndex((l) => l.id === choice.nextDialogue)
      if (targetIdx >= 0) {
        setLineIdx(targetIdx)
        return
      }
    }
    advance()
  }

  const isLast = lineIdx === lines.length - 1 && !current.choices?.length

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={handleTap}>
      <div className="w-full max-w-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* 루미 캐릭터 */}
        <div className="flex justify-center mb-[-20px] relative z-10">
          <Lumi mood={current.mood} size="md" showBubble={false} />
        </div>

        {/* 대화 상자 */}
        <div
          className="relative border-t-4 border-t-[var(--primary)] bg-white shadow-xl"
          onClick={handleTap}
          style={{ cursor: 'pointer' }}
        >
          {/* 이름 태그 */}
          <div className="absolute -top-4 left-4 bg-[var(--primary)] px-3 py-0.5 text-xs font-extrabold text-white shadow">
            루미
          </div>

          <div className="px-6 pt-5 pb-4 min-h-[100px]">
            {/* 대화 텍스트 (타이핑 효과) */}
            <p className="text-base font-bold leading-relaxed text-[var(--text-main)]">
              {visibleText}
              {isTyping && <span className="inline-block w-0.5 h-4 bg-[var(--primary)] ml-0.5 animate-pulse align-middle" />}
            </p>

            {/* 넘기기 표시 */}
            {typingDone && !current.choices?.length && (
              <div className="mt-3 text-right">
                <span className="text-xs font-bold text-[var(--text-light)] animate-pulse">
                  {isLast ? '닫기 ▼' : '다음 ▼'}
                </span>
              </div>
            )}
          </div>

          {/* 선택지 (포켓몬 스타일) */}
          {showChoices && current.choices && (
            <div className="border-t border-[var(--border)] bg-[var(--bg-main)] p-3">
              <div className="grid gap-2" style={{ gridTemplateColumns: current.choices.length <= 2 ? '1fr 1fr' : '1fr' }}>
                {current.choices.map((choice, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleChoice(choice) }}
                    className="group flex items-center gap-2 border-2 border-[var(--border)] bg-white px-4 py-3 text-left transition hover:border-[var(--primary)] hover:bg-[var(--primary-light)] active:scale-[0.97]"
                  >
                    <span className="flex h-6 w-6 items-center justify-center border-2 border-[var(--primary)] text-xs font-extrabold text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-main)]">{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 진행 표시 */}
          <div className="h-1 bg-[var(--bg-main)]">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${((lineIdx + 1) / lines.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
