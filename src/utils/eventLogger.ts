// ──────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────

export type ActivityType =
  | 'screen_enter'
  | 'screen_exit'
  | 'passage_browse'
  | 'passage_select'
  | 'goal_select'
  | 'confidence_set'
  | 'goal_confirm'
  | 'reading_start'
  | 'reading_end'
  | 'reading_retry'
  | 'self_rating_set'
  | 'difficulty_set'
  | 'assessment_submit'
  | 'result_scroll'
  | 'error_reclassify'
  | 'scaffold_view'
  | 'session_complete'

export type ScreenName =
  | 'passage_select'
  | 'goal_setting'
  | 'reading_activity'
  | 'self_assessment'
  | 'result_analysis'
  | 'completion'
  | 'session_history'
  | 'welcome'

export interface EventLog {
  id: string
  sessionId: string
  activity: ActivityType
  screen: ScreenName
  timestamp: number
  metadata?: Record<string, unknown>
}

// ──────────────────────────────────────────
// 이벤트 스토어
// ──────────────────────────────────────────

let currentSessionId: string = ''
let eventBuffer: EventLog[] = []

export function startEventSession(): string {
  currentSessionId = crypto.randomUUID()
  eventBuffer = []
  return currentSessionId
}

export function getSessionId(): string {
  return currentSessionId
}

export function logEvent(
  activity: ActivityType,
  screen: ScreenName,
  metadata?: Record<string, unknown>,
): EventLog {
  const event: EventLog = {
    id: crypto.randomUUID(),
    sessionId: currentSessionId,
    activity,
    screen,
    timestamp: Date.now(),
    metadata,
  }
  eventBuffer.push(event)
  return event
}

export function getEventBuffer(): EventLog[] {
  return [...eventBuffer]
}

export function clearEventBuffer(): void {
  eventBuffer = []
}

// ──────────────────────────────────────────
// 화면 체류 시간 계산
// ──────────────────────────────────────────

export function calculateScreenDurations(events: EventLog[]): Record<string, number> {
  const durations: Record<string, number> = {}
  const enterMap: Record<string, number> = {}

  for (const event of events) {
    if (event.activity === 'screen_enter') {
      enterMap[event.screen] = event.timestamp
    } else if (event.activity === 'screen_exit') {
      const enterTime = enterMap[event.screen]
      if (enterTime) {
        durations[event.screen] = (durations[event.screen] ?? 0) + (event.timestamp - enterTime)
        delete enterMap[event.screen]
      }
    }
  }

  return durations
}

// ──────────────────────────────────────────
// SRL 프로세스 매핑
// ──────────────────────────────────────────

export type SRLPhase = 'planning' | 'execution' | 'monitoring' | 'evaluation'

const activityToSRLPhase: Partial<Record<ActivityType, SRLPhase>> = {
  passage_browse: 'planning',
  passage_select: 'planning',
  goal_select: 'planning',
  confidence_set: 'planning',
  goal_confirm: 'planning',
  reading_start: 'execution',
  reading_end: 'execution',
  reading_retry: 'execution',
  self_rating_set: 'evaluation',
  difficulty_set: 'evaluation',
  assessment_submit: 'evaluation',
  result_scroll: 'monitoring',
  error_reclassify: 'monitoring',
  scaffold_view: 'monitoring',
}

export function calculateSRLDistribution(events: EventLog[]): Record<SRLPhase, number> {
  const durations: Record<SRLPhase, number> = {
    planning: 0,
    execution: 0,
    monitoring: 0,
    evaluation: 0,
  }

  for (let i = 0; i < events.length - 1; i++) {
    const phase = activityToSRLPhase[events[i].activity]
    if (phase) {
      const duration = events[i + 1].timestamp - events[i].timestamp
      durations[phase] += duration
    }
  }

  return durations
}

// ──────────────────────────────────────────
// XES 내보내기
// ──────────────────────────────────────────

export function exportToXES(allSessions: EventLog[][]): string {
  const grouped = new Map<string, EventLog[]>()
  for (const sessionEvents of allSessions) {
    for (const event of sessionEvents) {
      const existing = grouped.get(event.sessionId) ?? []
      existing.push(event)
      grouped.set(event.sessionId, existing)
    }
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<log xes.version="1.0" xes.features="nested-attributes">\n'

  for (const [sessionId, events] of grouped) {
    xml += '  <trace>\n'
    xml += `    <string key="concept:name" value="${sessionId}"/>\n`
    for (const event of events.sort((a, b) => a.timestamp - b.timestamp)) {
      xml += '    <event>\n'
      xml += `      <string key="concept:name" value="${event.activity}"/>\n`
      xml += `      <date key="time:timestamp" value="${new Date(event.timestamp).toISOString()}"/>\n`
      xml += `      <string key="screen" value="${event.screen}"/>\n`
      if (event.metadata) {
        for (const [k, v] of Object.entries(event.metadata)) {
          xml += `      <string key="${k}" value="${String(v)}"/>\n`
        }
      }
      xml += '    </event>\n'
    }
    xml += '  </trace>\n'
  }

  xml += '</log>'
  return xml
}

// ──────────────────────────────────────────
// CSV 내보내기
// ──────────────────────────────────────────

export function exportToCSV(events: EventLog[]): string {
  const header = 'session_id,activity,screen,timestamp,iso_time,metadata\n'
  const rows = events
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) =>
      `${e.sessionId},${e.activity},${e.screen},${e.timestamp},${new Date(e.timestamp).toISOString()},"${JSON.stringify(e.metadata ?? {}).replace(/"/g, '""')}"`,
    )
    .join('\n')
  return header + rows
}
