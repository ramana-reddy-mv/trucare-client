import { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { Link as RouterLink } from 'react-router-dom'
import { claimsApi, gatewayApi, getErrorMessage } from '../../api/client'
import { config } from '../../config'
import { useAuth } from '../../auth/AuthContext'
import PageHeader from '../../components/PageHeader'
import StatusChip from '../../components/StatusChip'
import { LoadingState } from '../../components/StatePanel'

const summaryCards = [
  { label: 'Total claims', key: 'totalClaims', color: '#146b67' },
  { label: 'Pending claims', key: 'pendingClaims', color: '#b8771f' },
  { label: 'Approved claims', key: 'approvedClaims', color: '#2e8064' },
  { label: 'Rejected claims', key: 'rejectedClaims', color: '#b54747' },
]

export default function DashboardPage() {
  const { session } = useAuth()
  const canReadClaims = session?.roles?.some((role) => ['CLAIM_OFFICER', 'ADMIN', 'SERVICE'].includes(role))
  const [health, setHealth] = useState({ state: 'loading' })
  const [summary, setSummary] = useState({ state: canReadClaims ? 'loading' : 'unavailable' })
  const [recent, setRecent] = useState({ state: canReadClaims ? 'loading' : 'unavailable' })

  useEffect(() => {
    let active = true
    gatewayApi.health().then(({ data }) => { if (active) setHealth({ state: 'ready', status: data.status || 'UP' }) }).catch((error) => { if (active) setHealth({ state: 'error', status: error.response?.status === 401 ? 'AUTH REQUIRED' : 'UNAVAILABLE' }) })
    if (canReadClaims) {
      claimsApi.dashboardSummary().then(({ data }) => { if (active) setSummary({ state: 'ready', data }) }).catch((error) => { if (active) setSummary({ state: 'error', message: getErrorMessage(error) }) })
      claimsApi.search({ page: 0, size: 5, sort: 'createdAt,desc' }).then(({ data }) => { if (active) setRecent({ state: 'ready', data }) }).catch((error) => { if (active) setRecent({ state: 'error', message: getErrorMessage(error) }) })
    }
    return () => { active = false }
  }, [canReadClaims])

  return <>
    <PageHeader eyebrow="CLAIMS OPERATIONS" title="Good to see you" description="Your TruCare workspace at a glance." />
    <Grid container spacing={2} sx={{ mb: 2.5 }}>{summaryCards.map((item) => <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: 2.4 }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="body2" color="text.secondary">{item.label}</Typography><Typography variant="h4" sx={{ my: 1, color: summary.state === 'ready' ? item.color : '#9caeb3' }}>{summary.state === 'ready' ? summary.data[item.key] : '—'}</Typography></Box><Box className="metric-icon" sx={{ color: item.color }}>{item.label.slice(0, 2).toUpperCase()}</Box></Stack><Typography variant="caption" color="text.secondary">{summary.state === 'ready' ? 'Live count from Claims Service' : summary.state === 'loading' ? 'Loading from Claims Service…' : 'Unavailable for your role or Claims Service is offline'}</Typography></CardContent></Card></Grid>)}</Grid>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 7 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: { xs: 2.5, md: 3 } }}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}><Box><Typography variant="h6">Service availability</Typography><Typography variant="body2" color="text.secondary">Gateway health and latest Prometheus scrape status</Typography></Box><Chip label="LIVE" size="small" variant="outlined" color="primary" /></Stack>
        <Stack spacing={1.8}><AvailabilityRow name="API Gateway" state={health.state} status={health.status} /><GatewayService name="Claim Service" service="claims" /><GatewayService name="Member Service" service="members" /></Stack>
        <Alert severity="info" sx={{ mt: 2.5 }}>Claim and Member health are read through the Gateway health proxy. Prometheus scrape status is also shown for monitored services.</Alert>
      </CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 5 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: { xs: 2.5, md: 3 } }}><Typography variant="h6">Claim status distribution</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 2.5 }}>Current record counts by lifecycle status</Typography>
        {summary.state === 'loading' && <LoadingState label="Loading claim summary…" />}{summary.state === 'ready' && <StatusDistribution values={summary.data.statusDistribution || []} />}{summary.state === 'error' && <Alert severity="warning">Claim totals are unavailable. {summary.message}</Alert>}{summary.state === 'unavailable' && <Unavailable detail="Claim summaries require claim officer, administrator, or service access." />}
        <Button component={RouterLink} to="/claims" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2 }}>View claims</Button>
      </CardContent></Card></Grid>
      <Grid size={{ xs: 12 }}><Card><CardContent sx={{ p: { xs: 2.5, md: 3 } }}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}><Box><Typography variant="h6">Recent claims</Typography><Typography variant="body2" color="text.secondary">Latest claims received by TruCare</Typography></Box><Button component={RouterLink} to="/claims" endIcon={<ArrowForwardRoundedIcon />}>All claims</Button></Stack>
        {recent.state === 'loading' && <LoadingState label="Loading recent claims…" />}{recent.state === 'error' && <Alert severity="warning">Recent claims are unavailable. {recent.message}</Alert>}{recent.state === 'unavailable' && <Unavailable detail="Claim list access requires claim officer, administrator, or service access." />}{recent.state === 'ready' && (recent.data.content?.length ? <Box sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow><TableCell>Claim</TableCell><TableCell>Member</TableCell><TableCell>Provider</TableCell><TableCell>Treatment</TableCell><TableCell>Status</TableCell><TableCell align="right">Amount</TableCell></TableRow></TableHead><TableBody>{recent.data.content.map((claim) => <TableRow key={claim.id || claim.claimId}><TableCell>{claim.claimId}</TableCell><TableCell>{claim.memberId}</TableCell><TableCell>{claim.providerId}</TableCell><TableCell>{claim.treatmentDate || '—'}</TableCell><TableCell><StatusChip status={claim.claimStatuses} /></TableCell><TableCell align="right">{claim.claimAmount ?? '—'}</TableCell></TableRow>)}</TableBody></Table></Box> : <Typography color="text.secondary" sx={{ py: 3 }}>No claims have been returned by the API.</Typography>)}
      </CardContent></Card></Grid>
      <Grid size={{ xs: 12 }}><Card><CardContent sx={{ p: { xs: 2.5, md: 3 } }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}><Box><Typography variant="h6">Monitoring tools</Typography><Typography variant="body2" color="text.secondary">Open monitoring interfaces or review live metrics.</Typography></Box><Stack direction="row" spacing={1} flexWrap="wrap"><Button component="a" href={config.jaegerUrl} target="_blank" rel="noreferrer" endIcon={<OpenInNewRoundedIcon />}>Jaeger</Button><Button component="a" href={config.grafanaUrl} target="_blank" rel="noreferrer" endIcon={<OpenInNewRoundedIcon />}>Grafana</Button><Button component={RouterLink} to="/observability" variant="contained">Observability</Button></Stack></Stack></CardContent></Card></Grid>
      <Grid size={{ xs: 12 }}><Card><CardContent sx={{ p: { xs: 2.5, md: 3 } }}><Typography variant="h6" sx={{ mb: 1.5 }}>Recent activity</Typography><Alert severity="info">Activity history is not available yet. The backend has no claim audit or recent activity endpoint, so this panel does not infer events from claim timestamps.</Alert></CardContent></Card></Grid>
    </Grid>
  </>
}

function AvailabilityRow({ name, state, status }) {
  return <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.6, border: '1px solid #e9eff0', borderRadius: 2 }}><Stack direction="row" alignItems="center" spacing={1.2}><Box className={`status-dot ${state === 'ready' && status === 'UP' ? 'online' : ''}`} /><Typography fontWeight={600}>{name}</Typography></Stack>{state === 'loading' ? <Typography variant="caption" color="text.secondary">Checking</Typography> : <StatusChip status={status} />}</Stack>
}
function GatewayService({ name, service }) {
  const [state, setState] = useState('loading')
  useEffect(() => { let active = true; gatewayApi.serviceHealth(service).then(({ data }) => { if (active) setState(data.status || 'UNKNOWN') }).catch((error) => { if (active) setState(error.response?.status === 401 ? 'AUTH REQUIRED' : 'UNAVAILABLE') }); return () => { active = false } }, [service])
  return <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.6, border: '1px solid #e9eff0', borderRadius: 2 }}><Stack direction="row" alignItems="center" spacing={1.2}><Box className={`status-dot ${state === 'UP' ? 'online' : ''}`} /><Typography fontWeight={600}>{name}</Typography></Stack><StatusChip status={state === 'loading' ? 'CHECKING' : state} /></Stack>
}
function StatusDistribution({ values }) {
  const total = values.reduce((sum, item) => sum + item.count, 0)
  if (!values.length) return <Typography color="text.secondary">No claim status data is available.</Typography>
  return <Stack spacing={1.4}>{values.map(({ status, count }) => <Box key={status}><Stack direction="row" justifyContent="space-between" sx={{ mb: .5 }}><Typography variant="body2">{String(status).replaceAll('_', ' ')}</Typography><Typography variant="body2" fontWeight={700}>{count}</Typography></Stack><Box sx={{ height: 7, bgcolor: '#edf1f2', borderRadius: 9 }}><Box sx={{ height: '100%', width: `${total ? (count / total) * 100 : 0}%`, bgcolor: /APPROVED|SETTLED/.test(status) ? '#2e8064' : /REJECTED|CANCELLED/.test(status) ? '#b54747' : '#c28a42', borderRadius: 9 }} /></Box></Box>)}</Stack>
}
function Unavailable({ detail }) { return <Box className="unavailable-panel" sx={{ minHeight: 130 }}><Typography fontWeight={700}>Data unavailable</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .7 }}>{detail}</Typography></Box> }
