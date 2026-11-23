// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, claimsApi, getErrorMessage } from './client'

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('claims API client', () => {
  it('sends claim submissions through the gateway with an idempotency key', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { claimId: 'CLM123456' } })
    const request = { memberId: 'M123', providerId: 'P123', policyNumber: 'POL123' }
    await claimsApi.create(request, 'one-time-key')
    expect(post).toHaveBeenCalledWith('/api/claims', request, { headers: { 'Idempotency-Key': 'one-time-key' } })
  })

  it('looks up claims by business ID for claim officers through the gateway', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { claimId: 'CLM123456' } })
    await claimsApi.getById('CLM 123/456')
    expect(get).toHaveBeenCalledWith('/api/claims/CLM%20123%2F456')
  })

  it('queries a paginated claims collection and dashboard summary', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: {} })
    await claimsApi.search({ page: 0, size: 10, status: 'APPROVED' })
    await claimsApi.dashboardSummary()
    expect(get).toHaveBeenNthCalledWith(1, '/api/claims', { params: { page: 0, size: 10, status: 'APPROVED' } })
    expect(get).toHaveBeenNthCalledWith(2, '/api/claims/dashboard/summary')
  })
})

describe('API errors', () => {
  it('shows backend-provided error messages', () => {
    expect(getErrorMessage({ response: { data: { message: 'Policy is not eligible' } } })).toBe('Policy is not eligible')
  })
  it('explains gateway network errors', () => {
    expect(getErrorMessage({ code: 'ERR_NETWORK' })).toContain('API Gateway')
  })
})

describe('JWT request handling', () => {
  it('forwards the active session token as a Bearer header', async () => {
    sessionStorage.setItem('trucare.accessToken', 'proxy-smoke-token')
    const adapter = vi.fn(async (request) => ({ data: {}, status: 200, statusText: 'OK', headers: {}, config: request }))
    await api.get('/api/claims/dashboard/summary', { adapter })
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer proxy-smoke-token')
  })
})
