export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  jaegerUrl: import.meta.env.VITE_JAEGER_URL || 'http://localhost:16686',
  prometheusUrl: import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090',
  grafanaUrl: import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3000',
}
