import type { GoalType } from '../types'

export type LumiMood = 'idle' | 'listening' | 'happy' | 'thinking' | 'cheering'

export interface LumiLine {
  screen: string
  condition?: string
  message: string
  mood: LumiMood
}

export const lumiMessages: Record<string, LumiLine[]> = {
  welcome: [
    { screen: 'welcome', message: '안녕! 오늘도 읽기 탐험을 떠나볼까?', mood: 'idle' },
    { screen: 'welcome', condition: 'newBadge', message: '와! 새 뱃지를 모았어!', mood: 'cheering' },
  ],
  goalSetting: [
    { screen: 'goalSetting', message: '오늘은 무엇에 집중해볼까?', mood: 'thinking' },
  ],
  readingBefore: [
    { screen: 'reading', condition: 'before', message: '준비됐으면 시작 버튼을 눌러!', mood: 'idle' },
  ],
  readingDuring: [
    { screen: 'reading', condition: 'during', message: '루미가 잘 듣고 있어요...', mood: 'listening' },
  ],
  readingAfter: [
    { screen: 'reading', condition: 'after', message: '잘 읽었어! 결과를 볼까?', mood: 'happy' },
  ],
  selfAssessment: [
    { screen: 'selfAssessment', message: '스스로 생각해봐. 얼마나 잘 읽었을까?', mood: 'thinking' },
  ],
  resultAnalysis: [
    { screen: 'resultAnalysis', message: '어절을 하나씩 확인해봐!', mood: 'idle' },
  ],
  completion: [
    { screen: 'completion', condition: 'levelUp', message: '축하해! 새로운 레벨에 도달했어!', mood: 'cheering' },
    { screen: 'completion', message: '오늘도 잘했어! 다음에 또 만나자.', mood: 'happy' },
    { screen: 'completion', condition: 'newBadge', message: '새 뱃지다! 컬렉션이 늘었어!', mood: 'cheering' },
  ],
  passage: [
    { screen: 'passage', message: '어떤 이야기가 재미있을까? 골라봐!', mood: 'thinking' },
  ],
}

export const goalMessages: Record<GoalType, string> = {
  accuracy: '정확하게 읽으면 루미가 기뻐해! 집중해보자.',
  speed: '리듬감 있게 쭉 읽어볼까? 루미가 시간을 재줄게.',
  reduction: '틀린 부분을 찾아서 고치는 건 정말 멋진 목표야!',
}

export function getScaffoldMessage(
  accuracy: number,
  goalType: GoalType,
  selfRating: number,
): LumiLine {
  if (accuracy < 40) {
    return {
      screen: 'resultAnalysis',
      mood: 'idle',
      message: '괜찮아! 쉬운 지문부터 천천히 시작하면 돼. 루미가 옆에서 도와줄게.',
    }
  }
  if (accuracy < 60) {
    return {
      screen: 'resultAnalysis',
      mood: 'thinking',
      message: '조금 어려웠지? 헷갈린 어절을 손가락으로 짚으면서 다시 읽어보자.',
    }
  }
  if (accuracy < 80) {
    return {
      screen: 'resultAnalysis',
      mood: 'happy',
      message:
        goalType === 'accuracy'
          ? '잘 읽었어! 빨간색으로 표시된 부분만 다시 연습하면 더 좋아질 거야.'
          : '좋은 흐름이야! 목표에 거의 도달했어. 한 번만 더 도전해볼까?',
    }
  }
  if (accuracy < 95) {
    return {
      screen: 'resultAnalysis',
      mood: 'happy',
      message:
        selfRating >= 4
          ? '자기평가도 정확하고 읽기도 잘했어! 스스로 실력을 알고 있구나.'
          : '읽기는 아주 잘했는데, 자기평가는 조금 낮았어. 자신감을 가져도 돼!',
    }
  }
  return {
    screen: 'resultAnalysis',
    mood: 'cheering',
    message: '와! 거의 완벽해! 더 긴 지문이나 어려운 이야기에 도전해볼까?',
  }
}

export function getMetacognitionFeedback(gap: number): LumiLine {
  if (gap === 0) {
    return { screen: 'resultAnalysis', mood: 'cheering', message: '자기평가가 정확해! 스스로를 잘 알고 있구나.' }
  }
  if (gap === 1) {
    return { screen: 'resultAnalysis', mood: 'happy', message: '거의 비슷해! 스스로를 꽤 잘 파악하고 있어.' }
  }
  if (gap === 2) {
    return { screen: 'resultAnalysis', mood: 'thinking', message: '자기평가와 실제 결과에 차이가 있어. 다음엔 더 정확하게 판단해보자!' }
  }
  return { screen: 'resultAnalysis', mood: 'thinking', message: '생각보다 차이가 크네. 읽을 때 어떤 부분이 어려운지 잘 관찰해봐!' }
}
