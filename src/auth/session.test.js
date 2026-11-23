// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, getSession, saveSession } from './session'

function token(payload) {
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${encoded}.signature`
}

describe('session storage', () => {
  beforeEach(() => { sessionStorage.clear() })

  it('stores a bearer session until the backend expiry', () => {
    const accessToken = token({ sub: 'case.manager', roles: ['CLAIM_OFFICER'], exp: Math.floor(Date.now() / 1000) + 900 })
    saveSession(accessToken, 900)
    expect(getSession()).toMatchObject({ token: accessToken, username: 'case.manager', roles: ['CLAIM_OFFICER'] })
  })

  it('clears expired or malformed sessions', () => {
    sessionStorage.setItem('trucare.accessToken', token({ sub: 'expired', roles: ['ADMIN'], exp: Math.floor(Date.now() / 1000) + 60 }))
    sessionStorage.setItem('trucare.expiresAt', String(Date.now() - 1))
    expect(getSession()).toBeNull()
    expect(sessionStorage.getItem('trucare.accessToken')).toBeNull()
  })

  it('rejects malformed token data and invalid lifetimes before storing', () => {
    expect(() => saveSession('invalid.token.value', 60)).toThrow('invalid access token')
    expect(() => saveSession(token({ sub: 'case.manager', roles: [], exp: 1 }), 0)).toThrow('invalid token lifetime')
    expect(sessionStorage.getItem('trucare.accessToken')).toBeNull()
  })

  it('clears both stored session values on logout', () => {
    saveSession(token({ sub: 'case.manager', roles: ['CLAIM_OFFICER'], exp: Math.floor(Date.now() / 1000) + 60 }), 60)
    clearSession()
    expect(getSession()).toBeNull()
  })
})
