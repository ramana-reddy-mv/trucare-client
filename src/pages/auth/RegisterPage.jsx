import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../../auth/AuthContext'
import { getErrorMessage } from '../../api/client'

export default function RegisterPage() {
  const { register } = useAuth(); const navigate = useNavigate()
  const [fields, setFields] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { await register(fields); navigate('/login', { state: { registered: true } }) } catch (failure) { setError(getErrorMessage(failure)) } finally { setBusy(false) } }
  return <Box className="auth-page"><Card sx={{ width: '100%', maxWidth: 460 }}><CardContent sx={{ p: { xs: 3, sm: 4 } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 4 }}><Box className="brand-mark">+</Box><Typography fontWeight={800} fontSize={20}>trucare</Typography></Box>
    <Typography variant="h5">Create your account</Typography><Typography color="text.secondary" sx={{ mt: .8, mb: 3 }}>New accounts start with pending member access.</Typography>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Stack component="form" spacing={2} onSubmit={submit}><TextField label="Username" value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} inputProps={{ minLength: 3, maxLength: 100, pattern: '[A-Za-z0-9._-]+' }} required helperText="3–100 characters: letters, numbers, dot, underscore or hyphen" /><TextField label="Email" type="email" value={fields.email} onChange={(e) => setFields({ ...fields, email: e.target.value })} required /><TextField label="Password" type="password" value={fields.password} onChange={(e) => setFields({ ...fields, password: e.target.value })} inputProps={{ minLength: 12, maxLength: 72 }} required helperText="Use at least 12 characters" /><Button variant="contained" size="large" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button></Stack>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>Already registered? <Link component={RouterLink} to="/login">Sign in</Link></Typography>
  </CardContent></Card></Box>
}
