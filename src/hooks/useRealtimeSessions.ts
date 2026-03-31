import { useEffect, useRef } from 'react'
import { subscribeToClassroomSessions } from '../lib/api'

export function useRealtimeSessions(
  classroomId: string | null,
  onNewSession: (session: unknown) => void,
) {
  const callbackRef = useRef(onNewSession)
  callbackRef.current = onNewSession

  useEffect(() => {
    if (!classroomId) return

    const { unsubscribe } = subscribeToClassroomSessions(
      classroomId,
      (session) => callbackRef.current(session),
    )

    return () => unsubscribe()
  }, [classroomId])
}
