# TruCare Client

TruCare Client is a React 19 and Vite 8 workspace for claims operations. It uses Material UI, React Router, and Axios, with a centralized API client for the API Gateway.

## Run locally

1. Copy .env.example to .env.local and update URLs if needed.
2. Install dependencies: npm ci
3. Start the app: npm run dev
4. Verify changes: npm run lint, npm test, and npm run build

The local Vite origin defaults to http://localhost:5173. Leave VITE_API_BASE_URL blank in local development: Vite proxies /api, /auth, /actuator, and /monitoring through the API Gateway, avoiding a browser cross-origin request. Set TRUCARE_GATEWAY_PROXY_URL if the Gateway is not at http://localhost:8080. In production, set VITE_API_BASE_URL to the same-origin API prefix or configure the hosting reverse proxy to forward these paths to the Gateway. Cross-origin deployments need an explicit, restricted CORS policy at the Gateway or hosting layer.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| VITE_API_BASE_URL | same origin via Vite proxy | Single backend entry point |
| TRUCARE_GATEWAY_PROXY_URL | http://localhost:8080 | Local Vite proxy target; server-side only |
| VITE_JAEGER_URL | http://localhost:16686 | Jaeger UI and query API |
| VITE_PROMETHEUS_URL | http://localhost:9090 | Prometheus query API |
| VITE_GRAFANA_URL | http://localhost:3000 | Grafana UI and health API |

Vite variables are public browser configuration. Never place credentials, signing keys, or tokens in them.

## Verified backend contracts

- Authentication: POST /auth/login accepts { usernameOrEmail, password } and returns { accessToken, tokenType, expiresIn }. Registration uses POST /auth/register with { name, email, password }; new accounts receive PENDING_MEMBER.
- Claim creation: POST /api/claims requires an Idempotency-Key header and fields memberId, providerId, policyNumber, treatmentType, treatmentDate, and claimAmount. Creation begins in PENDING_DOCUMENTS.
- Claim lookup and listing: claim officers, administrators, and service accounts can use GET /api/claims/{claimId} and the paginated GET /api/claims filters. The dashboard summary is GET /api/claims/dashboard/summary. The legacy /api/claims/by-claim-id/{claimId} lookup remains restricted to service accounts.
- Members: POST /api/members/addMember creates a profile. Pending-member submissions are associated with the signed-in username. GET /api/members is restricted to administrators and service accounts; GET /api/members/{memberId} enforces member ownership or privileged access. Responses include the generated memberId.
- Notifications: unread in-app notifications are loaded for the signed-in username, and owners can mark their notifications read.
- Health: /actuator/health checks the API Gateway. /monitoring/claims/health and /monitoring/members/health proxy only the corresponding services' health status through the Gateway.

The backend changes that add claim search/summary, the member ID response field, health proxy routes, and Gateway CORS configuration must be present and the services restarted for these screens to work.

## Access and limitations

- The client stores the access token in sessionStorage, attaches it as a Bearer token, and clears local session data at expiry or on a 401. The backend has no logout or refresh endpoint; signing out clears this browser session, while the JWT remains valid until its expiry.
- Registration produces PENDING_MEMBER. The current backend has no member role activation endpoint. Pending members can create a profile and submit claims but cannot read the member profile endpoint or list all members. The client does not add a promotion flow.
- Recent claim activity is not exposed as an audit/activity API, so the dashboard reports that section as unavailable instead of inferring events.
- Prometheus and Jaeger APIs are queried directly from the browser. If browser access or CORS is unavailable, the client reports monitoring data as unavailable and still provides the configured tool links. Grafana and Jaeger links open those tools; they are not presented as retrieved dashboard or trace data.

