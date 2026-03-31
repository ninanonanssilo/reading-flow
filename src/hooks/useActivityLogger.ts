import { useCallback } from 'react'
import { logEvent, type ActivityType, type ScreenName } from '../utils/eventLogger'

export function useActivityLogger(screen: ScreenName) {
  return useCallback(
    (activity: ActivityType, metadata?: Record<string, unknown>) => {
      logEvent(activity, screen, metadata)
    },
    [screen],
  )
}
