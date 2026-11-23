import { Box, Button, Stack, Typography } from '@mui/material'

export default function PageHeader({ eyebrow, title, description, action, onAction }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
    <Box><Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: '.12em' }}>{eyebrow}</Typography><Typography variant="h4" sx={{ mt: -.3 }}>{title}</Typography>{description && <Typography color="text.secondary" sx={{ mt: .7 }}>{description}</Typography>}</Box>
    {action && <Button variant="contained" onClick={onAction}>{action}</Button>}
  </Stack>
}
