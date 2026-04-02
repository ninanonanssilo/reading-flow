import { describe, it, expect, beforeEach, vi } from 'vitest'
import { startEventSession, logEvent, getEventBuffer, clearEventBuffer, calculateScreenDurations, calculateSRLDistribution, getSessionId } from './eventLogger'

beforeEach(() => {
  clearEventBuffer()
  // Mock hasEventLogConsent to return true for tests
  vi.mock('./privacy', () => ({
    hasEventLogConsent: () => true,
  }))
})

describe('startEventSession', () => {
  it('should return a UUID', () => {
    const id = startEventSession()
    expect(id).toMatch(/^[0-9a-f]{8}-/)
  })

  it('should clear previous buffer', () => {
    startEventSession()
    logEvent('reading_start', 'reading_activity')
    expect(getEventBuffer().length).toBe(1)

    startEventSession()
    expect(getEventBuffer().length).toBe(0)
  })
})

describe('logEvent', () => {
  it('should add event to buffer', () => {
    startEventSession()
    logEvent('passage_select', 'passage_select', { passageId: 'test' })
    const buffer = getEventBuffer()
    expect(buffer.length).toBe(1)
    expect(buffer[0].activity).toBe('passage_select')
    expect(buffer[0].metadata?.passageId).toBe('test')
  })

  it('should include sessionId and timestamp', () => {
    const sessionId = startEventSession()
    logEvent('reading_start', 'reading_activity')
    const event = getEventBuffer()[0]
    expect(event.sessionId).toBe(sessionId)
    expect(event.timestamp).toBeGreaterThan(0)
  })
})

describe('calculateScreenDurations', () => {
  it('should calculate time between enter and exit', () => {
    const events = [
      { id: '1', sessionId: 's', activity: 'screen_enter' as const, screen: 'goal_setting' as const, timestamp: 1000 },
      { id: '2', sessionId: 's', activity: 'screen_exit' as const, screen: 'goal_setting' as const, timestamp: 5000 },
    ]
    const durations = calculateScreenDurations(events)
    expect(durations['goal_setting']).toBe(4000)
  })

  it('should handle multiple visits to same screen', () => {
    const events = [
      { id: '1', sessionId: 's', activity: 'screen_enter' as const, screen: 'passage_select' as const, timestamp: 1000 },
      { id: '2', sessionId: 's', activity: 'screen_exit' as const, screen: 'passage_select' as const, timestamp: 3000 },
      { id: '3', sessionId: 's', activity: 'screen_enter' as const, screen: 'passage_select' as const, timestamp: 5000 },
      { id: '4', sessionId: 's', activity: 'screen_exit' as const, screen: 'passage_select' as const, timestamp: 7000 },
    ]
    const durations = calculateScreenDurations(events)
    expect(durations['passage_select']).toBe(4000)
  })
})

describe('calculateSRLDistribution', () => {
  it('should map activities to SRL phases', () => {
    const events = [
      { id: '1', sessionId: 's', activity: 'goal_select' as const, screen: 'goal_setting' as const, timestamp: 0 },
      { id: '2', sessionId: 's', activity: 'reading_start' as const, screen: 'reading_activity' as const, timestamp: 5000 },
      { id: '3', sessionId: 's', activity: 'reading_end' as const, screen: 'reading_activity' as const, timestamp: 65000 },
      { id: '4', sessionId: 's', activity: 'self_rating_set' as const, screen: 'self_assessment' as const, timestamp: 70000 },
    ]
    const dist = calculateSRLDistribution(events)
    expect(dist.planning).toBe(5000)
    expect(dist.execution).toBe(65000)
    expect(dist.evaluation).toBe(0) // last event, no duration
  })
})
