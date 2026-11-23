import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material'

export function LoadingState({ label = 'Loading data…' }) { return <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}><CircularProgress size={26} /><Typography color="text.secondary">{label}</Typography></Stack> }
export function EmptyState({ title, detail, children }) { return <Box sx={{ py: 5, textAlign: 'center' }}><Typography fontWeight={700}>{title}</Typography><Typography color="text.secondary" sx={{ mt: .7 }}>{detail}</Typography>{children}</Box> }
export function ErrorState({ message }) { return <Alert severity="error" sx={{ my: 2 }}>{message}</Alert> }
