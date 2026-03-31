import { useState, useRef, useEffect, useCallback } from 'react'

export type RecognitionState = 'idle' | 'listening' | 'unsupported' | 'error'

export function useSpeechRecognition(locale = 'ko-KR') {
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<RecognitionState>('idle')

  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setState('unsupported')
      setError('이 브라우저는 음성 인식을 지원하지 않습니다. 크롬 브라우저를 이용해주세요.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = locale

    recognition.onresult = (event: any) => {
      let currentTranscript = ''
      for (let i = 0; i < event.results.length; i++) {
         currentTranscript += event.results[i][0].transcript
      }
      setTranscript(currentTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        setError('음성 인식 중 오류가 발생했습니다.')
      }
    }

    recognition.onend = () => {
      setState((prev) => (prev === 'listening' ? 'idle' : prev))
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [locale])

  const start = useCallback(async () => {
    if (state === 'unsupported' || !recognitionRef.current) return

    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      mediaRecorder.start()

      recognitionRef.current.start()
      setState('listening')
      
    } catch (err) {
      setError('마이크 권한을 허용해주세요.')
      console.error(err)
    }
  }, [state])

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
      }

      const finishAndResolve = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        setState('idle')
        resolve(finalBlob)
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = finishAndResolve
        mediaRecorderRef.current.stop()
      } else {
        finishAndResolve()
      }
    })
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    transcript,
    state,
    error,
    start,
    stop,
    reset,
    setTranscript
  }
}
