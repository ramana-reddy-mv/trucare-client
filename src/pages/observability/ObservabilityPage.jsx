import { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Grid, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import axios from 'axios'
import { gatewayApi } from '../../api/client'
import { config } from '../../config'
import PageHeader from '../../components/PageHeader'
import StatusChip from '../../components/StatusChip'
import { LoadingState } from '../../components/StatePanel'

const empty = () => ({ status: 'CHECKING', data: null, error: '' })
export default function ObservabilityPage() {
  const [checks, setChecks] = useState({ gateway: empty(), claims: empty(), members: empty(), prometheus: empty(), rates: empty(), jaeger: empty(), grafana: empty() })
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    let active = true
    const update = (key, value) => { if (active) setChecks((old) => ({ ...old, [key]: value })) }
    const checkGateway = async (key, request) => {
      try { const { data } = await request(); update(key, { status: data.status || 'UNKNOWN', data, error: '' }) }
      catch (error) { update(key, { status: error.response?.status === 401 ? 'AUTH REQUIRED' : 'UNAVAILABLE', data: null, error: error.response?.status ? 'HTTP ' + error.response.status : 'Gateway health endpoint is unavailable.' }) }
    }
    const checkExternal = async (key, url, transform) => {
      try { const { data } = await axios.get(url, { timeout: 7000 }); update(key, { status: 'UP', data: transform(data), error: '' }) }
      catch (error) { update(key, { status: error.response?.status === 401 ? 'AUTH REQUIRED' : 'UNAVAILABLE', data: null, error: error.response?.status ? 'HTTP ' + error.response.status : 'Service did not respond or browser access was blocked.' }) }
    }
    checkGateway('gateway', gatewayApi.health)
    checkGateway('claims', () => gatewayApi.serviceHealth('claims'))
    checkGateway('members', () => gatewayApi.serviceHealth('members'))
    checkExternal('prometheus', config.prometheusUrl + '/api/v1/query?query=up', (d) => d.data?.result?.map((r) => ({ service: r.metric.service || r.metric.job || 'unknown', value: Number(r.value?.[1]) })) || [])
    checkExternal('rates', config.prometheusUrl + '/api/v1/query?query=sum%20by%20(service)%20(rate(http_server_requests_seconds_count%5B5m%5D))', (d) => d.data?.result?.map((r) => ({ service: r.metric.service || r.metric.job || 'unknown', rate: Number(r.value?.[1]) })) || [])
    checkExternal('jaeger', config.jaegerUrl + '/api/services', (d) => d.data || [])
    checkExternal('grafana', config.grafanaUrl + '/api/health', (d) => d.database || 'available')
    return () => { active = false }
  }, [refresh])
  const targets = checks.prometheus.data || []
  const rates = checks.rates.data || []
  const retry = () => { setChecks({ gateway: empty(), claims: empty(), members: empty(), prometheus: empty(), rates: empty(), jaeger: empty(), grafana: empty() }); setRefresh((v) => v + 1) }
  return <>
    <PageHeader eyebrow="PLATFORM HEALTH" title="Observability" description="Live service, metrics, and trace signals from the configured monitoring stack." action="Refresh" onAction={retry} />
    <Alert severity="info" sx={{ mb: 2.5 }}>Application health uses the API Gateway. Prometheus and Jaeger APIs are queried from your browser and must allow browser access. No monitoring credentials are sent by TruCare.</Alert>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><Integration title="API Gateway" record={checks.gateway} href={config.apiBaseUrl + '/actuator/health'} /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><Integration title="Claim Service" record={checks.claims} href={config.apiBaseUrl + '/monitoring/claims/health'} /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><Integration title="Member Service" record={checks.members} href={config.apiBaseUrl + '/monitoring/members/health'} /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><Integration title="Prometheus" record={checks.prometheus} href={config.prometheusUrl} detail={targets.length + ' scrape series'} /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><Integration title="Jaeger" record={checks.jaeger} href={config.jaegerUrl} detail={(checks.jaeger.data || []).length + ' services reporting'} /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><Integration title="Grafana" record={checks.grafana} href={config.grafanaUrl} detail={checks.grafana.data ? 'Database ' + checks.grafana.data : ''} /></Grid>
      <Grid size={{ xs: 12, lg: 7 }}><Card><CardContent><Typography variant="h6">Prometheus scrape targets</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Latest up samples from Prometheus.</Typography>{checks.prometheus.status === 'CHECKING' ? <LoadingState label="Querying Prometheus…" /> : checks.prometheus.data ? targets.length ? <Box sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow><TableCell>Service</TableCell><TableCell>Status</TableCell><TableCell align="right">Value</TableCell></TableRow></TableHead><TableBody>{targets.map((r, i) => <TableRow key={r.service + i}><TableCell>{r.service}</TableCell><TableCell><StatusChip status={r.value === 1 ? 'UP' : 'DOWN'} /></TableCell><TableCell align="right">{r.value}</TableCell></TableRow>)}</TableBody></Table></Box> : <Typography color="text.secondary">Prometheus returned no scrape targets.</Typography> : <Alert severity="warning">Prometheus data is unavailable. {checks.prometheus.error}</Alert>}</CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 5 }}><Card><CardContent><Typography variant="h6">Request rate</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Requests per second over the last five minutes.</Typography>{checks.rates.status === 'CHECKING' ? <LoadingState label="Reading request metrics…" /> : checks.rates.data ? rates.length ? <Stack spacing={1.5}>{rates.map((r, i) => <Stack key={r.service + i} direction="row" justifyContent="space-between" sx={{ p: 1.5, bgcolor: '#f5f8f8', borderRadius: 2 }}><Typography>{r.service}</Typography><Typography color="primary.main" fontWeight={700}>{r.rate.toFixed(2)} req/s</Typography></Stack>)}</Stack> : <Typography color="text.secondary">No request-rate series have been emitted yet.</Typography> : <Alert severity="warning">Metrics unavailable. {checks.rates.error}</Alert>}</CardContent></Card></Grid>
      <Grid size={{ xs: 12 }}><Card><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}><Box><Typography variant="h6">Explore traces and dashboards</Typography><Typography variant="body2" color="text.secondary">Trace and dashboard detail remains in each monitoring tool.</Typography></Box><Stack direction="row" spacing={1}><Button component="a" href={config.jaegerUrl + '/search'} target="_blank" rel="noreferrer" endIcon={<OpenInNewRoundedIcon />}>Explore traces</Button><Button component="a" href={config.grafanaUrl} target="_blank" rel="noreferrer" variant="contained" endIcon={<OpenInNewRoundedIcon />}>Open Grafana</Button></Stack></Stack><Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>This page retrieves Jaeger’s service list and Grafana’s health response, not trace trees or dashboard panels.</Typography></CardContent></Card></Grid>
    </Grid>
  </>
}

function Integration({ title, record, href, detail }) {
  return <Card sx={{ height: '100%' }}><CardContent sx={{ p: 2.4 }}><Stack direction="row" justifyContent="space-between"><Typography variant="h6">{title}</Typography><StatusChip status={record.status} /></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{record.error || detail || record.data?.status || (record.status === 'CHECKING' ? 'Checking…' : 'No status data')}</Typography><Link href={href} target="_blank" rel="noreferrer" underline="hover" variant="caption" sx={{ mt: 1.5, display: 'inline-flex', alignItems: 'center', gap: .5 }}>Open service <OpenInNewRoundedIcon sx={{ fontSize: 14 }} /></Link></CardContent></Card>
}
