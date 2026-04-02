import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, hasValidConsent, hasAudioConsent, hasEventLogConsent, anonymizeStudentName } from './privacy'

describe('hashPassword', () => {
  it('should return a hex string', async () => {
    const hash = await hashPassword('test123')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should produce consistent hashes', async () => {
    const h1 = await hashPassword('hello')
    const h2 = await hashPassword('hello')
    expect(h1).toBe(h2)
  })

  it('should produce different hashes for different inputs', async () => {
    const h1 = await hashPassword('password1')
    const h2 = await hashPassword('password2')
    expect(h1).not.toBe(h2)
  })
})

describe('verifyPassword', () => {
  it('should verify correct password', async () => {
    const hash = await hashPassword('mypass')
    expect(await verifyPassword('mypass', hash)).toBe(true)
  })

  it('should reject wrong password', async () => {
    const hash = await hashPassword('mypass')
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })
})

describe('consent functions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('hasValidConsent should return false when no consent', () => {
    expect(hasValidConsent()).toBe(false)
  })

  it('hasValidConsent should return true with valid consent', () => {
    localStorage.setItem('reading-flow-consent', JSON.stringify({
      required_data: true,
      studentConfirmedAt: Date.now(),
    }))
    expect(hasValidConsent()).toBe(true)
  })

  it('hasValidConsent should return false without studentConfirmedAt', () => {
    localStorage.setItem('reading-flow-consent', JSON.stringify({
      required_data: true,
    }))
    expect(hasValidConsent()).toBe(false)
  })

  it('hasAudioConsent should return false by default', () => {
    expect(hasAudioConsent()).toBe(false)
  })

  it('hasAudioConsent should return true when opted in', () => {
    localStorage.setItem('reading-flow-consent', JSON.stringify({
      audio_recording: true,
    }))
    expect(hasAudioConsent()).toBe(true)
  })

  it('hasEventLogConsent should return false by default', () => {
    expect(hasEventLogConsent()).toBe(false)
  })
})

describe('anonymizeStudentName', () => {
  it('should return S001 format', () => {
    expect(anonymizeStudentName('김민수', 0)).toBe('S001')
    expect(anonymizeStudentName('이영희', 1)).toBe('S002')
    expect(anonymizeStudentName('박철수', 99)).toBe('S100')
  })
})
