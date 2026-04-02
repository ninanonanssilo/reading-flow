import { hasAudioConsent } from '../../utils/privacy'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { passages } from '../../data/passages'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { analyzeReading } from '../../utils/basa'
import { saveAudioBlob } from '../../utils/audioStorage'
import { getPreReadingScaffold, getDuringReadingScaffold, determineHHAIRLevel } from '../../utils/scaffold'
import type { RegulationLevel } from '../../types'
import { useScreenLogger } from '../../hooks/useScreenLogger'
import { useActivityLogger } from '../../hooks/useActivityLogger'
import Lumi from '../components/Lumi'
import LumiDialogue from '../components/LumiDialogue'
import { preReadingDialogue } from '../../data/lumiDialogues'
import StudentLayout from '../components/StudentLayout'

export default function ReadingActivity() {
  useScreenLogger('reading_activity')
  const log = useActivityLogger('reading_activity')
  const navigate = useNavigate()
  const { draft, player, setTranscript, markReadingWindow, setAnalysis, setAudioId } = useFlow()
  const speech = useSpeechRecognition('ko-KR')
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showPreDialogue, setShowPreDialogue] = useState(() => {
    const key = 'reading-flow-preread-' + draft.passageId
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      return true
    }
    return false
  })
  const passage = useMemo(
    () => passages.find((item) => item.id === draft.passageId) ?? passages[0],
    [draft.passageId],
  )

  useEffect(() => {
    setTranscript(speech.transcript)
  }, [speech.transcript]) // setTranscript는 useCallback으로 안정적 참조

  useEffect(() => {
    if (speech.state !== 'listening' || !draft.readingStartedAt) return
    const timer = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - draft.readingStartedAt!) / 1000))
    }, 500)
    return () => window.clearInterval(timer)


  }, [draft.readingStartedAt, speech.state])

  const handleStart = () => {
    log('reading_start')
    markReadingWindow(Date.now(), null)
    setElapsed(0)
    setFinished(false)
    speech.reset()
    speech.start()
  }

  const handleFinish = async () => {
    const endedAt = Date.now()
    log('reading_end', { elapsedSeconds: elapsed, transcriptLength: speech.transcript.length })
    const blob = await speech.stop()
    const startedAt = draft.readingStartedAt ?? endedAt

    if (blob && hasAudioConsent()) {
      const audioId = `audio_${Date.now()}`
      await saveAudioBlob(audioId, blob)
      setAudioId(audioId)
    }

    const currentTranscript = speech.transcript
    const readingTimeSeconds = Math.max(1, ((endedAt - startedAt) / 1000) || elapsed || 1)
    const analysis = analyzeReading(passage.text, currentTranscript, readingTimeSeconds)

    markReadingWindow(startedAt, endedAt)
    setTranscript(currentTranscript)
    setAnalysis(analysis)
    setFinished(true)
  }

  const currentHHAIR: RegulationLevel = useMemo(
    () => player.sessions.length >= 3
      ? determineHHAIRLevel(player.sessions, player.sessions[player.sessions.length - 1]?.analysis.accuracy ?? 0)
      : 'ai-adjusted',
    [player.sessions],
  )

  const preScaffold = useMemo(
    () => getPreReadingScaffold(draft.goalType ?? 'accuracy', player.sessions),
    [draft.goalType, player.sessions],
  )

  const duringScaffold = useMemo(
    () => getDuringReadingScaffold(currentHHAIR),
    [currentHHAIR],
  )

  const isRecording = speech.state === 'listening'

  return (
    <StudentLayout
      title="소리 내어 읽어 보세요"
      subtitle="마이크를 켜고 지문을 읽으면 루미가 분석해드려요."
    >
      {showPreDialogue && <LumiDialogue lines={preReadingDialogue} onComplete={() => setShowPreDialogue(false)} playerName={player.name} />}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* 지문 */}
        <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-2xl">{passage.thumbnailEmoji}</span>
              <h3 className="mt-1 text-xl font-extrabold text-[var(--text-main)]">{passage.title}</h3>
            </div>
            <div className="bg-[var(--primary-light)] px-4 py-2 text-lg font-extrabold text-[var(--primary)]">
              {elapsed}초
            </div>
          </div>
          <p className="whitespace-pre-line text-lg leading-[2.2] text-[var(--text-main)]">{passage.text}</p>
        </div>

        {/* 컨트롤 & 결과 */}
        <div className="space-y-4">
          {/* 녹음 상태 + 루미 */}
          <div className={`border-2 p-4 shadow-sm ${isRecording ? 'border-red-400 bg-red-50' : 'border-[var(--border)] bg-white'}`}>
            <div className="flex items-center gap-3">
              {isRecording ? (
                <Lumi mood={duringScaffold.mood} size="sm" message={duringScaffold.message} />
              ) : finished ? (
                <Lumi mood="happy" size="sm" message="잘 읽었어!" showBubble={false} />
              ) : (
                <Lumi mood={preScaffold.mood} size="sm" message={preScaffold.message} />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm font-bold text-[var(--text-main)]">
                    {isRecording
                      ? '녹음 중... 또박또박 읽어보세요!'
                      : finished
                        ? '✓ 녹음 완료!'
                        : '아래 버튼을 눌러 시작하세요'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 읽기 완료 패널 */}
          {finished && draft.analysis ? (
            <div className="space-y-4 animate-slide-up">
              {/* 완료 헤더 + 루미 */}
              <div className="border-2 border-[var(--secondary)] bg-[var(--secondary-light)] p-5">
                <div className="flex items-center gap-3">
                  <Lumi
                    mood={draft.analysis!.accuracy >= 80 ? 'cheering' : draft.analysis!.accuracy >= 60 ? 'happy' : 'thinking'}
                    size="sm"
                    showBubble={false}
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-emerald-800">읽기 완료!</h3>
                    <p className="text-sm text-emerald-600">루미가 분석한 결과예요.</p>
                  </div>
                </div>
              </div>

              {/* 정확도 + 읽기 속도 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[var(--border)] bg-white p-4 text-center">
                  <div className="text-xs font-bold text-[var(--text-light)]">맞게 읽은 정도</div>
                  <div className="mt-1 text-2xl font-extrabold text-[var(--primary)]">{draft.analysis.accuracy}%</div>
                </div>
                <div className="border border-[var(--border)] bg-white p-4 text-center">
                  <div className="text-xs font-bold text-[var(--text-light)]">걸린 시간</div>
                  <div className="mt-1 text-2xl font-extrabold text-[var(--accent-orange)]">{draft.analysis.readingTime}초</div>
                </div>
              </div>

              {/* 오류 유형 */}
              <div className="border border-[var(--border)] bg-white p-5">
                <h4 className="mb-3 text-sm font-extrabold text-[var(--text-main)]">어떤 실수가 있었을까요?</h4>
                <div className="space-y-2">
                  {draft.analysis.errorCounts.substitution > 0 && (
                    <div className="flex items-center gap-3 border-l-4 border-l-red-400 bg-red-50 px-4 py-2.5">
                      <div className="flex-1 text-sm font-bold text-red-700">다른 말로 바꿔 읽었어요 <span className="text-xs text-red-400">(대치)</span></div>
                      <span className="bg-red-100 px-3 py-1 text-sm font-extrabold text-red-700">{draft.analysis.errorCounts.substitution}번</span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.omission > 0 && (
                    <div className="flex items-center gap-3 border-l-4 border-l-orange-400 bg-orange-50 px-4 py-2.5">
                      <div className="flex-1 text-sm font-bold text-orange-700">빠뜨리고 안 읽었어요 <span className="text-xs text-orange-400">(생략)</span></div>
                      <span className="bg-orange-100 px-3 py-1 text-sm font-extrabold text-orange-700">{draft.analysis.errorCounts.omission}번</span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.addition > 0 && (
                    <div className="flex items-center gap-3 border-l-4 border-l-purple-400 bg-purple-50 px-4 py-2.5">
                      <div className="flex-1 text-sm font-bold text-purple-700">없는 말을 넣어 읽었어요 <span className="text-xs text-purple-400">(첨가)</span></div>
                      <span className="bg-purple-100 px-3 py-1 text-sm font-extrabold text-purple-700">{draft.analysis.errorCounts.addition}번</span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.repetition > 0 && (
                    <div className="flex items-center gap-3 border-l-4 border-l-blue-400 bg-blue-50 px-4 py-2.5">
                      <div className="flex-1 text-sm font-bold text-blue-700">같은 말을 반복했어요 <span className="text-xs text-blue-400">(반복)</span></div>
                      <span className="bg-blue-100 px-3 py-1 text-sm font-extrabold text-blue-700">{draft.analysis.errorCounts.repetition}번</span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.selfCorrection > 0 && (
                    <div className="flex items-center gap-3 border-l-4 border-l-green-400 bg-green-50 px-4 py-2.5">
                      <div className="flex-1 text-sm font-bold text-green-700">틀렸다가 스스로 고쳤어요 <span className="text-xs text-green-400">(자기교정)</span></div>
                      <span className="bg-green-100 px-3 py-1 text-sm font-extrabold text-green-700">{draft.analysis.errorCounts.selfCorrection}번</span>
                    </div>
                  )}
                  {draft.analysis.totalErrors === 0 && (
                    <div className="border-l-4 border-l-[var(--secondary)] bg-[var(--secondary-light)] px-4 py-3 text-center">
                      <span className="text-sm font-bold text-emerald-700">실수 없이 완벽하게 읽었어요!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 루미 한마디 */}
              <div className="flex items-start gap-3 border-l-4 border-l-[var(--primary)] bg-[var(--primary-light)] p-4">
                <Lumi
                  mood={draft.analysis.accuracy >= 85 ? 'cheering' : draft.analysis.accuracy >= 60 ? 'happy' : 'idle'}
                  size="sm"
                  showBubble={false}
                />
                <p className="text-sm font-bold leading-relaxed text-[var(--primary-dark)]">
                  {draft.analysis.accuracy >= 85
                    ? '와! 아주 잘 읽었어요! 다음에는 더 어려운 지문에 도전해볼까요?'
                    : draft.analysis.accuracy >= 60
                      ? '잘 읽었어요! 조금 헷갈린 부분을 다시 연습하면 더 잘할 수 있을 거예요.'
                      : '괜찮아요! 천천히 다시 읽어보면 분명 더 잘할 수 있어요. 포기하지 마세요!'}
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/assess')}
                  className="w-full bg-[var(--primary)] py-3.5 text-base font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)]"
                >
                  자기평가 하러 가기 →
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full border border-[var(--border)] bg-white py-3 text-sm font-bold text-[var(--text-sub)] transition hover:shadow-sm"
                >
                  다시 읽기
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 전사 결과 */}
              <div className="border border-[var(--border)] bg-[var(--text-main)] p-5">
                <p className="mb-2 text-xs font-bold text-gray-400">실시간 전사</p>
                <p className="min-h-24 text-base leading-7 text-gray-100">
                  {speech.transcript || '아직 인식된 내용이 없어요. 시작 버튼을 누르고 읽어보세요!'}
                </p>
                {speech.error && (
                  <div className="mb-4 text-center text-sm font-bold text-red-500">
                    {speech.error}
                  </div>
                )}
                <textarea
                  value={speech.transcript}
                  onChange={(e) => {
                    speech.setTranscript(e.target.value)
                    setTranscript(e.target.value)
                  }}
                  className="mt-3 min-h-20 w-full border border-white/10 bg-white/10 p-3 text-sm text-white outline-none placeholder:text-gray-500"
                  placeholder="직접 입력도 가능해요"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStart}
                    className="flex-1 bg-[var(--secondary)] py-3.5 text-base font-extrabold text-white shadow-md transition hover:opacity-90"
                  >
                    🎤 읽기 시작
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex-1 bg-red-500 py-3.5 text-base font-extrabold text-white shadow-md transition hover:opacity-90 animate-pulse"
                  >
                    ⏹ 읽기 종료
                  </button>
                )}
                <Link
                  to="/goal"
                  className="border border-[var(--border)] bg-white px-5 py-3.5 text-sm font-bold text-[var(--text-sub)] transition hover:shadow-sm"
                >
                  ← 목표
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
