import { useEffect, useRef } from 'react'
import { logEvent, type ScreenName } from '../utils/eventLogger'

export function useScreenLogger(screen: ScreenName) {
  const screenRef = useRef(screen)
  screenRef.current = screen

  useEffect(() => {
    logEvent('screen_enter', screenRef.current)
    return () => {
      logEvent('screen_exit', screenRef.current)
    }
  }, [])
}
