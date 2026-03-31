import { useEffect, useMemo, useRef, useState } from 'react'

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike
type RecognitionState = 'idle' | 'listening' | 'unsupported'

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function useSpeechRecognition(locale = 'ko-KR') {
  const [transcript, setTranscript] = useState('')
  const [state, setState] = useState<RecognitionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const recognitionClass = useMemo(
    () => window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null,
    [],
  )

  useEffect(() => {
    if (!recognitionClass) {
      setState('unsupported')
      return
    }

    const recognition = new recognitionClass()
    recognition.lang = locale
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setState('listening')
      setError(null)
    }

    recognition.onend = () => {
      setState('idle')
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setState('idle')
    }

    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()

      setTranscript(nextTranscript)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [locale, recognitionClass])

  return {
    transcript,
    state,
    error,
    isSupported: state !== 'unsupported',
    setTranscript,
    start: () => recognitionRef.current?.start(),
    stop: () => recognitionRef.current?.stop(),
    reset: () => setTranscript(''),
  }
}
