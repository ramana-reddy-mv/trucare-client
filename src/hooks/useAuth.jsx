import { useEffect, useMemo, useState } from 'react'
import { clearSession, getSession, saveSession } from '../auth/session'
import { AuthContext } from '../auth/AuthContext'
import { authApi } from '../api/client'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession())
  useEffect(() => {
    const unauthorized = () => setSession(null)
    window.addEventListener('trucare:unauthorized', unauthorized)
    const timer = session ? window.setTimeout(() => { clearSession(); setSession(null) }, Math.max(0, session.expiresAt - Date.now())) : undefined
    return () => { window.removeEventListener('trucare:unauthorized', unauthorized); if (timer) clearTimeout(timer) }
  }, [session])
  const value = useMemo(() => ({ session,
    login: async (credentials) => { const { data } = await authApi.login(credentials); saveSession(data.accessToken, data.expiresIn); setSession(getSession()) },
    register: (details) => authApi.register(details),
    logout: () => { clearSession(); setSession(null) },
  }), [session])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

