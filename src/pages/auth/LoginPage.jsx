import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../../auth/AuthContext'
import { getErrorMessage } from '../../api/client'

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await login({ usernameOrEmail: usernameOrEmail.trim(), password }); navigate(location.state?.from?.pathname || '/', { replace: true }) }
    catch (failure) { setError(getErrorMessage(failure)) } finally { setBusy(false) }
  }
  return <Box className="auth-page"><Card sx={{ width: '100%', maxWidth: 440 }}><CardContent sx={{ p: { xs: 3, sm: 4 } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 4 }}><Box className="brand-mark">+</Box><Typography fontWeight={800} fontSize={20}>trucare</Typography></Box>
    <Typography variant="h5">Welcome back</Typography><Typography color="text.secondary" sx={{ mt: .8, mb: 3 }}>Sign in to manage healthcare claims securely.</Typography>
    {location.state?.registered && <Alert severity="success" sx={{ mb: 2 }}>Account created. Sign in to continue; your new account starts with pending-member access.</Alert>}{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Stack component="form" spacing={2} onSubmit={submit}><TextField label="Username or email" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} autoComplete="username" required fullWidth /><TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required fullWidth /><Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button></Stack>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>New to TruCare? <Link component={RouterLink} to="/register" underline="hover">Create an account</Link></Typography>
  </CardContent></Card><Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>Protected access · TruCare Claims Operations</Typography></Box>
}
