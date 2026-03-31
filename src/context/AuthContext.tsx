import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { UserAccount, UserRole } from '../types'

const USERS_KEY = 'reading-flow-users'
const SESSION_KEY = 'reading-flow-session'

interface AuthContextValue {
  user: UserAccount | null
  isLoggedIn: boolean
  login: (username: string, password: string, role: UserRole) => string | null
  register: (username: string, password: string, role: UserRole, privacyConsent: boolean) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

function writeSession(userId: string | null) {
  if (userId) {
    localStorage.setItem(SESSION_KEY, userId)
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const sessionId = readSession()
    if (!sessionId) return null
    const users = readUsers()
    return users.find((u) => u.id === sessionId) ?? null
  })

  useEffect(() => {
    writeSession(user?.id ?? null)
  }, [user])

  const register = useCallback((username: string, password: string, role: UserRole, privacyConsent: boolean): string | null => {
    if (!username.trim()) return '아이디를 입력해주세요.'
    if (username.trim().length < 2) return '아이디는 2자 이상이어야 합니다.'
    if (!password) return '비밀번호를 입력해주세요.'
    if (password.length < 4) return '비밀번호는 4자 이상이어야 합니다.'
    if (!privacyConsent) return '개인정보 수집·이용에 동의해주세요.'

    const users = readUsers()
    if (users.find((u) => u.username === username.trim() && u.role === role)) {
      return '이미 사용 중인 아이디입니다.'
    }

    const newUser: UserAccount = {
      id: crypto.randomUUID(),
      username: username.trim(),
      password,
      role,
      privacyConsent: true,
      privacyConsentAt: Date.now(),
      createdAt: Date.now(),
    }

    writeUsers([...users, newUser])
    setUser(newUser)
    return null
  }, [])

  const login = useCallback((username: string, password: string, role: UserRole): string | null => {
    if (!username.trim()) return '아이디를 입력해주세요.'
    if (!password) return '비밀번호를 입력해주세요.'

    const users = readUsers()
    const found = users.find((u) => u.username === username.trim() && u.password === password && u.role === role)
    if (!found) return '아이디 또는 비밀번호가 일치하지 않습니다.'

    setUser(found)
    return null
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
