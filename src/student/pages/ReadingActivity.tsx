import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFlow } from '../../context/FlowContext'
import { passages } from '../../data/passages'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { analyzeReading } from '../../utils/basa'
import StudentLayout from '../components/StudentLayout'

export default function ReadingActivity() {
  const navigate = useNavigate()
  const { draft, setTranscript, markReadingWindow, setAnalysis } = useFlow()
  const speech = useSpeechRecognition('ko-KR')
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const passage = useMemo(
    () => passages.find((item) => item.id === draft.passageId) ?? passages[0],
    [draft.passageId],
  )

  useEffect(() => {
    setTranscript(speech.transcript)
  }, [setTranscript, speech.transcript])

  useEffect(() => {
    if (speech.state !== 'listening' || !draft.readingStartedAt) return
    const timer = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - draft.readingStartedAt!) / 1000))
    }, 500)
    return () => window.clearInterval(timer)
  }, [draft.readingStartedAt, speech.state])

  const handleStart = () => {
    markReadingWindow(Date.now(), null)
    setElapsed(0)
    setFinished(false)
    speech.reset()
    speech.start()
  }

  const handleFinish = () => {
    const endedAt = Date.now()
    speech.stop()
    const startedAt = draft.readingStartedAt ?? endedAt
    const currentTranscript = speech.transcript
    const readingTimeSeconds = Math.max(1, ((endedAt - startedAt) / 1000) || elapsed || 1)
    const analysis = analyzeReading(passage.text, currentTranscript, readingTimeSeconds)
    markReadingWindow(startedAt, endedAt)
    setTranscript(currentTranscript)
    setAnalysis(analysis)
    setFinished(true)
  }

  const isRecording = speech.state === 'listening'

  return (
    <StudentLayout
      title="소리 내어 읽어 보세요 🎤"
      subtitle="마이크를 켜고 지문을 읽으면 루미가 분석해드려요."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* 지문 */}
        <div className="rounded-3xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-3xl">{passage.thumbnailEmoji}</span>
              <h3 className="mt-1 text-xl font-extrabold text-amber-900">{passage.title}</h3>
            </div>
            <div className="rounded-full bg-orange-100 px-4 py-2 text-lg font-extrabold text-orange-600">
              {elapsed}초
            </div>
          </div>
          <p className="whitespace-pre-line text-lg leading-[2.2] text-amber-900">{passage.text}</p>
        </div>

        {/* 컨트롤 & 결과 */}
        <div className="space-y-5">
          {/* 녹음 상태 */}
          <div className={`rounded-3xl p-5 shadow-md ${isRecording ? 'bg-red-50 border-2 border-red-200' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm font-bold text-amber-900">
                {isRecording ? '녹음 중... 또박또박 읽어보세요!' : finished ? '✅ 녹음 완료!' : '아래 버튼을 눌러 시작하세요'}
              </span>
            </div>
          </div>

          {/* 읽기 완료 패널 */}
          {finished && draft.analysis ? (
            <div className="space-y-4">
              {/* 읽기 완료 헤더 */}
              <div className="rounded-3xl border-3 border-green-300 bg-green-50 p-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎉</span>
                  <div>
                    <h3 className="text-lg font-extrabold text-green-800">읽기 완료!</h3>
                    <p className="text-sm text-green-600">루미가 분석한 결과예요.</p>
                  </div>
                </div>
              </div>

              {/* 정확도 + 읽기 속도 (아이 친화적 표현) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 text-center shadow-md">
                  <div className="text-2xl">🎯</div>
                  <div className="mt-1 text-2xl font-extrabold text-orange-700">{draft.analysis.accuracy}%</div>
                  <div className="text-xs font-bold text-amber-600">맞게 읽은 정도</div>
                </div>
                <div className="rounded-2xl bg-white p-4 text-center shadow-md">
                  <div className="text-2xl">⏱️</div>
                  <div className="mt-1 text-2xl font-extrabold text-sky-700">{draft.analysis.readingTime}초</div>
                  <div className="text-xs font-bold text-amber-600">읽는 데 걸린 시간</div>
                </div>
              </div>

              {/* 오류 유형 설명 */}
              <div className="rounded-3xl bg-white p-5 shadow-md">
                <h4 className="mb-3 text-sm font-extrabold text-amber-900">📋 어떤 실수가 있었을까요?</h4>
                <div className="space-y-2">
                  {draft.analysis.errorCounts.substitution > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-2.5">
                      <span className="text-xl">🔄</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-red-700">다른 말로 바꿔 읽었어요</span>
                        <span className="text-xs text-red-500"> (대치)</span>
                      </div>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-extrabold text-red-700">
                        {draft.analysis.errorCounts.substitution}번
                      </span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.omission > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl bg-orange-50 px-4 py-2.5">
                      <span className="text-xl">⏭️</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-orange-700">빠뜨리고 안 읽었어요</span>
                        <span className="text-xs text-orange-500"> (생략)</span>
                      </div>
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-extrabold text-orange-700">
                        {draft.analysis.errorCounts.omission}번
                      </span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.addition > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl bg-purple-50 px-4 py-2.5">
                      <span className="text-xl">➕</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-purple-700">없는 말을 넣어 읽었어요</span>
                        <span className="text-xs text-purple-500"> (첨가)</span>
                      </div>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-extrabold text-purple-700">
                        {draft.analysis.errorCounts.addition}번
                      </span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.repetition > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-2.5">
                      <span className="text-xl">🔁</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-blue-700">같은 말을 반복했어요</span>
                        <span className="text-xs text-blue-500"> (반복)</span>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-extrabold text-blue-700">
                        {draft.analysis.errorCounts.repetition}번
                      </span>
                    </div>
                  )}
                  {draft.analysis.errorCounts.selfCorrection > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-2.5">
                      <span className="text-xl">✨</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-green-700">틀렸다가 스스로 고쳤어요</span>
                        <span className="text-xs text-green-500"> (자기교정)</span>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-extrabold text-green-700">
                        {draft.analysis.errorCounts.selfCorrection}번
                      </span>
                    </div>
                  )}
                  {draft.analysis.totalErrors === 0 && (
                    <div className="rounded-2xl bg-green-50 px-4 py-3 text-center">
                      <span className="text-lg">🏆</span>
                      <span className="ml-2 text-sm font-bold text-green-700">실수 없이 완벽하게 읽었어요!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 루미 한마디 */}
              <div className="rounded-3xl bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚀</span>
                  <p className="text-sm font-bold leading-relaxed text-amber-800">
                    {draft.analysis.accuracy >= 85
                      ? '와! 아주 잘 읽었어요! 다음에는 더 어려운 지문에 도전해볼까요?'
                      : draft.analysis.accuracy >= 60
                        ? '잘 읽었어요! 조금 헷갈린 부분을 다시 연습하면 더 잘할 수 있을 거예요.'
                        : '괜찮아요! 천천히 다시 읽어보면 분명 더 잘할 수 있어요. 포기하지 마세요!'}
                  </p>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/assess')}
                  className="w-full rounded-full bg-orange-500 py-3.5 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition hover:scale-105"
                >
                  자기평가 하러 가기 →
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full rounded-full bg-white py-3 text-sm font-bold text-amber-700 shadow-sm transition hover:scale-105"
                >
                  🔄 다시 읽기
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 전사 결과 */}
              <div className="rounded-3xl bg-amber-900 p-5 shadow-md">
                <p className="mb-2 text-xs font-bold text-amber-300">실시간 전사</p>
                <p className="min-h-24 text-base leading-7 text-amber-50">
                  {speech.transcript || '아직 인식된 내용이 없어요. 🎤 버튼을 누르고 읽어보세요!'}
                </p>
                {speech.error && <p className="mt-2 text-sm text-red-300">오류: {speech.error}</p>}
                <textarea
                  value={speech.transcript}
                  onChange={(e) => {
                    speech.setTranscript(e.target.value)
                    setTranscript(e.target.value)
                  }}
                  className="mt-3 min-h-20 w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-white outline-none placeholder:text-amber-400/50"
                  placeholder="직접 입력도 가능해요"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStart}
                    className="flex-1 rounded-full bg-green-500 py-3.5 text-base font-extrabold text-white shadow-lg shadow-green-200 transition hover:scale-105"
                  >
                    🎤 읽기 시작
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex-1 rounded-full bg-red-500 py-3.5 text-base font-extrabold text-white shadow-lg shadow-red-200 transition hover:scale-105 animate-pulse"
                  >
                    ⏹️ 읽기 종료
                  </button>
                )}
                <Link
                  to="/goal"
                  className="rounded-full bg-white px-5 py-3.5 text-sm font-bold text-amber-700 shadow-sm transition hover:scale-105"
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
