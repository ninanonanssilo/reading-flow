import type { DialogueLine } from '../student/components/LumiDialogue'

// ──────────────────────────────────────────
// 첫 방문 인사 (WelcomeScreen)
// ─��──────────────────────────────���─────────

export const welcomeFirstVisit: DialogueLine[] = [
  {
    id: 'welcome-1',
    text: '안녕, {name}! 나는 루미야. 읽기 우주탐험대의 안내원이지!',
    mood: 'idle',
  },
  {
    id: 'welcome-2',
    text: '나랑 같이 지문을 읽고, 실력을 키워보자. 준비됐어?',
    mood: 'happy',
    choices: [
      { label: '응! 바로 시작할래!', value: 'eager' },
      { label: '음... 좀 무서워', value: 'nervous' },
    ],
  },
  {
    id: 'welcome-eager',
    text: '좋아! 그 자신감이 최고야! 지문을 골라��� 읽어볼까?',
    mood: 'cheering',
  },
  {
    id: 'welcome-nervous',
    text: '괜찮아! 처음엔 누구나 그래. 루미가 옆에서 도와줄게. 천천히 해보자!',
    mood: 'idle',
  },
]

// ──────────────────────────────────────────
// 재방문 인사 (WelcomeScreen, sessions > 0)
// ──��───────────────────────────────────────

export const welcomeReturning: DialogueLine[] = [
  {
    id: 'return-1',
    text: '{name}, 다시 왔구나! 오늘도 함께 읽기 탐험을 떠나볼까?',
    mood: 'happy',
    choices: [
      { label: '응, 오늘도 열심히!', value: 'ready' },
      { label: '지난번 기록 먼저 볼래', value: 'history' },
      { label: '그냥 둘러볼게', value: 'browse' },
    ],
  },
]

// ──────────────────���───────────────────────
// 읽기 전 격려 (ReadingActivity, 시작 전)
// ──────────────────────────────────────────

export const preReadingDialogue: DialogueLine[] = [
  {
    id: 'preread-1',
    text: '지문이 준비됐어! 읽기 전에 한 가지 물어볼게.',
    mood: 'thinking',
  },
  {
    id: 'preread-2',
    text: '오늘 읽기에서 가장 신경 쓰고 싶은 게 뭐야?',
    mood: 'thinking',
    choices: [
      { label: '틀리지 않고 정확하게 읽기', value: 'accuracy' },
      { label: '막힘 없이 술술 읽기', value: 'fluency' },
      { label: '크고 또렷한 목소리로 읽기', value: 'voice' },
      { label: '잘 모르겠어', value: 'unsure' },
    ],
  },
  {
    id: 'preread-3',
    text: '좋아! 그 부분에 집중하면서 읽어봐. 루미가 잘 듣고 있을게!',
    mood: 'idle',
  },
]

// ──────────────────────────────────────────
// 결과 분석 후 대화 (ResultAnalysis)
// ─────────────────────���────────────────────

export function getPostReadingDialogue(accuracy: number, totalErrors: number): DialogueLine[] {
  if (accuracy >= 90) {
    return [
      {
        id: 'post-great-1',
        text: '와! 정말 잘 읽었어, {name}! 정확도가 무려 ' + accuracy.toFixed(0) + '%야!',
        mood: 'cheering',
      },
      {
        id: 'post-great-2',
        text: '다음에는 어떻게 하고 싶어?',
        mood: 'happy',
        choices: [
          { label: '더 어려운 지문에 도전!', value: 'harder' },
          { label: '같은 지문 더 빨리 읽어볼래', value: 'faster' },
          { label: '오늘은 여기까지!', value: 'done' },
        ],
      },
    ]
  }
  if (accuracy >= 60) {
    return [
      {
        id: 'post-good-1',
        text: '잘 읽었어! 정확도 ' + accuracy.toFixed(0) + '%, 조금만 더 연습하면 완벽해질 거야.',
        mood: 'happy',
      },
      {
        id: 'post-good-2',
        text: '틀린 부분을 어떻게 할까?',
        mood: 'thinking',
        choices: [
          { label: '어디가 틀렸는지 자세히 볼래', value: 'review' },
          { label: '같은 지문 다시 읽어볼래', value: 'retry' },
          { label: '다음에 할래', value: 'later' },
        ],
      },
    ]
  }
  return [
    {
      id: 'post-try-1',
      text: '괜찮아, {name}! 처음부터 잘하는 사람은 없어.',
      mood: 'idle',
    },
    {
      id: 'post-try-2',
      text: '루미가 도와줄게. 어떻게 하고 싶어?',
      mood: 'thinking',
      choices: [
        { label: '더 쉬운 지문으로 바꿀래', value: 'easier' },
        { label: '한 번 더 읽어볼래', value: 'retry' },
        { label: '틀린 부분만 확인할래', value: 'review' },
      ],
    },
  ]
}

// ────────��─────────────────────────────────
// 완료 축하 대화 (Completion)
// ─────────���────────────────────────────────

export function getCompletionDialogue(stars: number, leveledUp: boolean, newBadges: number): DialogueLine[] {
  const lines: DialogueLine[] = []

  if (leveledUp) {
    lines.push({
      id: 'comp-levelup',
      text: '축하해, {name}! 새로운 레벨에 도달했어! 대단하��!',
      mood: 'cheering',
    })
  }

  if (newBadges > 0) {
    lines.push({
      id: 'comp-badge',
      text: '와! 새 뱃지를 ' + newBadges + '개나 획득했어! 컬렉션을 확인해봐!',
      mood: 'cheering',
    })
  }

  lines.push({
    id: 'comp-stars',
    text: '오늘 별 ' + stars + '개를 모았어! ' + (stars >= 3 ? '최고야!' : '다음엔 더 많이 모을 수 있을 거야!'),
    mood: stars >= 3 ? 'cheering' : 'happy',
  })

  lines.push({
    id: 'comp-next',
    text: '다음에 뭐 ��고 싶어?',
    mood: 'idle',
    choices: [
      { label: '한 번 더 읽을래!', value: 'again' },
      { label: '내 기록 볼래', value: 'history' },
      { label: '오늘은 여기까지', value: 'done' },
    ],
  })

  return lines
}

// ──────��───────────────────────────────────
// 세션 히스토리 진입 대화
// ───��────────────────��─────────────────────

export const historyDialogue: DialogueLine[] = [
  {
    id: 'hist-1',
    text: '여기가 {name}의 읽기 여행 기록이야! 어떤 걸 확인해볼까?',
    mood: 'thinking',
    choices: [
      { label: 'CWPM 변화 보기', value: 'chart' },
      { label: '세션 목록 보기', value: 'list' },
      { label: '그냥 둘러볼게', value: 'browse' },
    ],
  },
]
