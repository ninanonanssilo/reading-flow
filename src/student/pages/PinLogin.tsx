import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginStudent, resolveClassCode } from '../../lib/api'
import { isOnlineMode } from '../../lib/supabase'
import Lumi from '../components/Lumi'
import StudentLayout from '../components/StudentLayout'

export default function PinLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [classroomId, setClassroomId] = useState('')
  const [classroomName, setClassroomName] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [resolving, setResolving] = useState(false)
  const navigate = useNavigate()

  const params = new URLSearchParams(window.location.search)
  const paramClass = params.get('class') ?? ''
  const paramCode = params.get('code') ?? ''

  useEffect(() => {
    if (paramClass) {
      setClassroomId(paramClass)
    } else if (paramCode) {
      setResolving(true)
      resolveClassCode(paramCode).then((result) => {
        setResolving(false)
        if (result) {
          setClassroomId(result.id)
          setClassroomName(result.name)
        } else {
          setError('학급코드를 찾을 수 없습니다.')
        }
      })
    }
  }, [paramClass, paramCode])

  if (!isOnlineMode) {
    navigate('/welcome', { replace: true })
    return null
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeInput.trim()) return
    setResolving(true)
    setError('')
    const result = await resolveClassCode(codeInput.trim())
    setResolving(false)
    if (result) {
      setClassroomId(result.id)
      setClassroomName(result.name)
    } else {
      setError('학급코드를 찾을 수 없습니다. 다시 확인해주세요.')
    }
  }

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      attemptLogin(next)
    }
  }

  const attemptLogin = async (code: string) => {
    setError('')
    setLoading(true)
    const result = await loginStudent(classroomId, code)
    setLoading(false)
    if (result.success) {
      navigate('/welcome')
    } else {
      setError(result.message ?? 'PIN이 맞지 않아요. 다시 입력해주세요.')
      setPin('')
    }
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '\u232B']

  // 학급코드 입력 화면 (classroomId가 아직 없을 때)
  if (!classroomId && !resolving) {
    return (
      <StudentLayout title="학급코드를 입력해주세요" subtitle="선생님이 알려준 코드를 입력하세요">
        <div className="mx-auto w-full max-w-xs">
          <div className="mb-6 flex justify-center">
            <Lumi mood="idle" size="md" message="학급코드를 알려줘!" />
          </div>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="예: ABC123"
              maxLength={6}
              className="mb-4 w-full border-2 border-[var(--border)] bg-white px-4 py-4 text-center font-mono text-2xl font-extrabold tracking-widest outline-none focus:border-[var(--primary)]"
            />
            {error && (
              <p className="mb-4 text-center text-sm font-bold text-red-500">{error}</p>
            )}
            <button
              type="submit"
              disabled={codeInput.length < 4}
              className="w-full border border-[var(--primary)] bg-[var(--primary)] py-3 text-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              확인
            </button>
          </form>
        </div>
      </StudentLayout>
    )
  }

  if (resolving) {
    return (
      <StudentLayout title="학급 확인 중..." subtitle="">
        <div className="flex justify-center py-12">
          <Lumi mood="thinking" size="md" message="확인 중..." />
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout title={classroomName || '비밀번호를 눌러주세요'} subtitle={classroomName ? '4자리 PIN을 입력하세요' : '선생님이 알려준 4자리 숫자를 입력하세요'}>
      <div className="mx-auto w-full max-w-xs">
        <div className="mb-6 flex justify-center">
          <Lumi mood={loading ? 'thinking' : 'idle'} size="md" message={loading ? '확인 중...' : '숫자를 눌러봐!'} />
        </div>

        {/* PIN 표시 */}
        <div className="mb-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-14 w-14 border-2 text-center text-2xl font-extrabold leading-[3.5rem] ${
                pin.length > i
                  ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                  : 'border-[var(--border)] bg-white text-transparent'
              }`}
            >
              {pin[i] ?? '\u00B7'}
            </div>
          ))}
        </div>

        {error && (
          <p className="mb-4 text-center text-sm font-bold text-red-500">{error}</p>
        )}

        {/* 키패드 */}
        <div className="grid grid-cols-3 gap-2">
          {digits.map((d, i) => (
            <button
              key={i}
              type="button"
              disabled={!d || loading}
              onClick={() => (d === '\u232B' ? setPin(pin.slice(0, -1)) : handleDigit(d))}
              className={`h-16 text-2xl font-extrabold transition ${
                d === '\u232B'
                  ? 'bg-gray-100 text-[var(--text-sub)]'
                  : d
                    ? 'border border-[var(--border)] bg-white text-[var(--text-main)] hover:bg-[var(--primary-light)] active:bg-[var(--primary)] active:text-white'
                    : 'invisible'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
