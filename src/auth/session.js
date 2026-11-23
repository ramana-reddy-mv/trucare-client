const TOKEN_KEY = 'trucare.accessToken'
const EXPIRY_KEY = 'trucare.expiresAt'

function decodePayload(token) {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')), (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch { return null }
}

export function saveSession(token, expiresIn) {
  const payload = typeof token === 'string' ? decodePayload(token) : null
  if (!payload?.sub || !Array.isArray(payload.roles) || !payload.roles.every((role) => typeof role === 'string') || !Number.isFinite(payload.exp)) {
    throw new Error('The authentication service returned an invalid access token.')
  }
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error('The authentication service returned an invalid token lifetime.')
  }
  const expiresAt = Date.now() + expiresIn * 1000
  if (!Number.isFinite(expiresAt)) throw new Error('The access token lifetime is out of range.')
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(EXPIRY_KEY, String(expiresAt))
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EXPIRY_KEY)
}

export function getSession() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const expiresAt = Number(sessionStorage.getItem(EXPIRY_KEY))
  if (!token || !Number.isFinite(expiresAt) || expiresAt <= 0 || Date.now() >= expiresAt) { clearSession(); return null }
  const payload = decodePayload(token)
  if (!payload?.sub || !Array.isArray(payload.roles) || !payload.roles.every((role) => typeof role === 'string') || !Number.isFinite(payload.exp)) { clearSession(); return null }
  return { token, username: payload.sub, roles: payload.roles || [], expiresAt }
}
