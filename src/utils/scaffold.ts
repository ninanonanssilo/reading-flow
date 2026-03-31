import type { ErrorCounts, GoalType, ReadingAnalysis, RegulationLevel, SessionData } from '../types'

// ──────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────

export type ScaffoldType =
  | 'directive'     // 직접 지시 — AI regulation
  | 'suggestive'    // 제안 — Co-regulation
  | 'reflective'    // 성찰 유도 — Shared-regulation
  | 'celebratory'   // 축하/자율 — Self-regulation

export type LumiMood = 'idle' | 'listening' | 'happy' | 'thinking' | 'cheering'

export interface ScaffoldOutput {
  message: string
  mood: LumiMood
  scaffoldType: ScaffoldType
  hhairLevel: RegulationLevel
  hint?: string
  suggestedAction?: string
}

// ──────────────────────────────────────────
// 1. HHAIR 조절 수준 결정 함수
// ──────────────────────────────────────────

export function determineHHAIRLevel(
  sessions: SessionData[],
  currentAccuracy: number,
): RegulationLevel {
  if (sessions.length < 3) {
    return currentAccuracy >= 80 ? 'co-regulated' : 'ai-adjusted'
  }

  const recent3 = sessions.slice(-3)
  const avgAccuracy = recent3.reduce((sum, s) => sum + s.analysis.accuracy, 0) / 3
  const trend = recent3[2].analysis.accuracy - recent3[0].analysis.accuracy

  const avgGap = recent3.reduce((sum, s) => {
    const aiRating = Math.max(1, Math.min(5, Math.round(s.analysis.accuracy / 20)))
    return sum + Math.abs(aiRating - s.selfAssessment.selfRating)
  }, 0) / 3

  if (avgAccuracy >= 80 && trend >= 0 && avgGap <= 1) return 'self-regulated'
  if (avgAccuracy >= 65 && trend >= -5 && avgGap <= 2) return 'shared-regulated'
  if (avgAccuracy >= 50) return 'co-regulated'
  return 'ai-adjusted'
}

// ──────────────────────────────────────────
// 2. 오류 패턴 분석 함수
// ──────────────────────────────────────────

export function getDominantError(errorCounts: ErrorCounts): {
  type: string
  count: number
  label: string
} {
  const entries = [
    { type: 'substitution', count: errorCounts.substitution, label: '대치' },
    { type: 'omission', count: errorCounts.omission, label: '생략' },
    { type: 'addition', count: errorCounts.addition, label: '첨가' },
    { type: 'repetition', count: errorCounts.repetition, label: '반복' },
    { type: 'selfCorrection', count: errorCounts.selfCorrection, label: '자기교정' },
  ]
  return entries.sort((a, b) => b.count - a.count)[0]
}

// ──────────────────────────────────────────
// 3. 메인 스캐폴딩 엔진
// ──────────────────────────────────────────

export function generateScaffold(
  analysis: ReadingAnalysis,
  goalType: GoalType,
  selfRating: number,
  sessions: SessionData[],
): ScaffoldOutput {
  const { accuracy, cwpm, errorCounts, totalErrors } = analysis
  const hhairLevel = determineHHAIRLevel(sessions, accuracy)
  const dominant = getDominantError(errorCounts)
  const aiRating = Math.max(1, Math.min(5, Math.round(accuracy / 20)))
  const gap = Math.abs(aiRating - selfRating)

  const prevSession = sessions.length > 0 ? sessions[sessions.length - 1] : null
  const accuracyDelta = prevSession ? accuracy - prevSession.analysis.accuracy : 0
  const cwpmDelta = prevSession ? cwpm - prevSession.analysis.cwpm : 0

  switch (hhairLevel) {
    case 'ai-adjusted':
      return scaffoldAIAdjusted(accuracy, goalType, dominant, accuracyDelta)
    case 'co-regulated':
      return scaffoldCoRegulated(accuracy, goalType, dominant, gap, accuracyDelta)
    case 'shared-regulated':
      return scaffoldSharedRegulated(accuracy, goalType, dominant, gap, selfRating, cwpmDelta)
    case 'self-regulated':
      return scaffoldSelfRegulated(accuracy, goalType, gap, selfRating, cwpmDelta, totalErrors)
  }
}

// ──────────────────────────────────────────
// 4. HHAIR 수준별 스캐폴딩 생성 함수
// ──────────────────────────────────────────

function scaffoldAIAdjusted(
  accuracy: number,
  _goalType: GoalType,
  dominant: { type: string; label: string; count: number },
  accuracyDelta: number,
): ScaffoldOutput {
  const base: ScaffoldOutput = {
    mood: 'idle',
    scaffoldType: 'directive',
    hhairLevel: 'ai-adjusted',
    message: '',
  }

  if (accuracy < 30) {
    base.message = '괜찮아, 처음부터 잘하는 사람은 없어! 루미가 천천히 도와줄게.'
    base.hint = '먼저 지문을 눈으로 한 번 읽어본 다음, 손가락으로 짚으면서 소리 내어 읽어봐.'
    base.suggestedAction = '더 쉬운 지문으로 다시 도전하기'
  } else if (dominant.count >= 3) {
    base.message = `'${dominant.label}' 실수가 ${dominant.count}번 있었어. 루미가 알려줄게!`
    base.hint = dominant.type === 'omission'
      ? '글자를 빠뜨리지 않으려면 손가락으로 한 글자씩 짚으면서 읽어봐.'
      : dominant.type === 'substitution'
        ? '비슷한 글자를 헷갈린 것 같아. 틀린 부분을 크게 소리 내서 세 번 읽어봐.'
        : '같은 부분을 반복하지 않으려면, 읽은 곳에 손가락을 놓고 앞으로만 가봐.'
    base.suggestedAction = '같은 지문 다시 읽기'
  } else {
    base.message = '조금 어려웠지? 쉬운 지문부터 차근차근 연습하면 금방 늘어!'
    base.hint = '짧은 문장부터 또박또박 읽는 연습을 해보자.'
    base.suggestedAction = '더 쉬운 지문 선택하기'
  }

  if (accuracyDelta > 5) {
    base.message += ' 그래도 지난번보다 나아졌어!'
    base.mood = 'happy'
  }

  return base
}

function scaffoldCoRegulated(
  accuracy: number,
  goalType: GoalType,
  dominant: { type: string; label: string; count: number },
  gap: number,
  accuracyDelta: number,
): ScaffoldOutput {
  const base: ScaffoldOutput = {
    mood: 'thinking',
    scaffoldType: 'suggestive',
    hhairLevel: 'co-regulated',
    message: '',
  }

  if (goalType === 'accuracy' && dominant.count >= 2) {
    base.message = `'${dominant.label}' 부분을 집중해서 연습해보는 건 어떨까?`
    base.hint = '아래 빨간색으로 표시된 어절을 천천히 다시 읽어봐.'
  } else if (goalType === 'speed') {
    base.message = accuracy >= 70
      ? '정확도는 좋아! 이제 조금 더 자연스럽게 쭉 이어서 읽어볼까?'
      : '속도보다 정확하게 읽는 게 먼저야. 먼저 정확하게 읽는 연습을 하자!'
  } else if (goalType === 'reduction') {
    base.message = accuracyDelta > 0
      ? `지난번보다 실수가 줄었어! ${dominant.label}을(를) 좀 더 신경 쓰면 더 좋아질 거야.`
      : `${dominant.label} 실수가 아직 있어. 그 부분만 따로 연습해보는 건 어때?`
  } else {
    base.message = '전체적으로 잘 읽었어! 어떤 부분이 어려웠는지 같이 살펴볼까?'
  }

  if (gap >= 3) {
    base.message += ' 그리고 자기평가를 다시 생각해봐. 실제 결과와 좀 달랐어.'
  }

  return base
}

function scaffoldSharedRegulated(
  accuracy: number,
  goalType: GoalType,
  dominant: { type: string; label: string; count: number },
  gap: number,
  selfRating: number,
  cwpmDelta: number,
): ScaffoldOutput {
  const base: ScaffoldOutput = {
    mood: 'happy',
    scaffoldType: 'reflective',
    hhairLevel: 'shared-regulated',
    message: '',
  }

  if (gap <= 1) {
    base.message = '자기평가가 정확해! 스스로의 읽기를 잘 파악하고 있구나.'
    if (accuracy >= 80) {
      base.message += ' 다음엔 어떤 목표를 세우면 좋을까 생각해봐.'
    }
  } else if (selfRating > (accuracy / 20)) {
    base.message = '자기평가보다 실제 결과가 조금 낮았어. 어떤 부분이 예상과 달랐을까?'
  } else {
    base.message = '생각보다 잘 읽었어! 자신감을 좀 더 가져도 돼.'
    base.mood = 'cheering'
  }

  const goalMet = goalType === 'accuracy' ? accuracy >= 80
    : goalType === 'speed' ? cwpmDelta > 0
    : dominant.count <= 1

  if (goalMet) {
    base.message += ' 오늘 목표도 잘 달성했어!'
  } else {
    base.message += ' 목표에 조금 못 미쳤지만, 어떤 점을 바꾸면 될지 생각해봐.'
  }

  return base
}

function scaffoldSelfRegulated(
  accuracy: number,
  _goalType: GoalType,
  gap: number,
  _selfRating: number,
  _cwpmDelta: number,
  totalErrors: number,
): ScaffoldOutput {
  const base: ScaffoldOutput = {
    mood: 'cheering',
    scaffoldType: 'celebratory',
    hhairLevel: 'self-regulated',
    message: '',
  }

  if (totalErrors === 0) {
    base.message = '완벽해! 더 어려운 지문이나 새로운 목표에 도전해볼 때가 된 것 같아.'
    base.suggestedAction = '난이도 올리기'
  } else if (accuracy >= 90 && gap <= 1) {
    base.message = '읽기 실력도, 자기 판단 능력도 훌륭해. 스스로 잘 관리하고 있구나!'
  } else {
    base.message = '잘하고 있어! 오늘 느낀 점을 기억하면서 다음에도 도전해봐.'
  }

  return base
}

// ──────────────────────────────────────────
// 5. 화면별 스캐폴딩 (읽기 전/중)
// ──────────────────────────────────────────

export function getPreReadingScaffold(
  goalType: GoalType,
  sessions: SessionData[],
): { message: string; mood: LumiMood } {
  const hhairLevel = sessions.length >= 3
    ? determineHHAIRLevel(sessions, sessions[sessions.length - 1]?.analysis.accuracy ?? 0)
    : 'ai-adjusted' as const

  if (hhairLevel === 'ai-adjusted') {
    return goalType === 'accuracy'
      ? { mood: 'idle', message: '손가락으로 글자를 짚으면서 천천히 읽어봐. 루미가 잘 듣고 있을게!' }
      : goalType === 'speed'
        ? { mood: 'idle', message: '너무 빨리 읽지 않아도 돼. 자연스럽게 쭉 이어서 읽어봐.' }
        : { mood: 'idle', message: '지난번에 틀렸던 부분을 떠올리면서 읽어봐!' }
  }
  if (hhairLevel === 'co-regulated') {
    return { mood: 'thinking', message: '오늘 목표를 한 번 떠올리고, 준비되면 시작해!' }
  }
  if (hhairLevel === 'shared-regulated') {
    return { mood: 'happy', message: '오늘은 어떤 점에 집중해볼지 스스로 정해봐!' }
  }
  return { mood: 'happy', message: '준비됐으면 시작! 루미는 옆에서 응원할게.' }
}

export function getDuringReadingScaffold(
  hhairLevel: RegulationLevel,
): { message: string; mood: LumiMood } {
  switch (hhairLevel) {
    case 'ai-adjusted':
      return { mood: 'listening', message: '루미가 잘 듣고 있어. 천천히 또박또박!' }
    case 'co-regulated':
      return { mood: 'listening', message: '잘 읽고 있어! 계속 가보자.' }
    case 'shared-regulated':
    case 'self-regulated':
      return { mood: 'listening', message: '집중해서 읽고 있구나!' }
  }
}

// ──────────────────────────────────────────
// 6. 메타인지 피드백 (결과 화면용)
// ──────────────────────────────────────────

export function getMetacognitionFeedback(
  gap: number,
  selfRating: number,
  aiRating: number,
): { message: string; mood: LumiMood } {
  if (gap === 0) return { mood: 'cheering', message: '자기평가가 정확해! 스스로를 잘 알고 있구나.' }
  if (gap === 1) return { mood: 'happy', message: '거의 비슷해! 스스로를 꽤 잘 파악하고 있어.' }
  if (selfRating > aiRating) {
    return gap >= 3
      ? { mood: 'thinking', message: '자기평가가 좀 높았어. 어떤 부분에서 실수했는지 아래에서 확인해봐!' }
      : { mood: 'thinking', message: '조금 높게 평가한 것 같아. 다음엔 더 꼼꼼히 판단해보자.' }
  }
  return gap >= 3
    ? { mood: 'happy', message: '생각보다 잘 읽었어! 자신감을 가져도 돼.' }
    : { mood: 'happy', message: '자기평가보다 실제 결과가 더 좋았어. 스스로를 좀 더 믿어봐!' }
}
