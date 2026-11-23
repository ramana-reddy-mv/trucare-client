import { Chip } from '@mui/material'

export default function StatusChip({ status }) {
  const value = String(status || 'UNKNOWN').replaceAll('_', ' ')
  const color = /APPROVED|SETTLED|ACTIVE|UP|SUCCESS|COMPLETED/i.test(value) ? 'success' : /REJECTED|CANCELLED|DOWN|FAILED|ERROR/i.test(value) ? 'error' : /PENDING|PROCESS|WARNING/i.test(value) ? 'warning' : 'default'
  return <Chip size="small" label={value} color={color} variant={color === 'default' ? 'outlined' : 'filled'} />
}
