import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gatewayTarget = env.TRUCARE_GATEWAY_PROXY_URL || 'http://localhost:8080'
  const gatewayProxy = Object.fromEntries(['/api', '/auth', '/actuator', '/monitoring'].map((path) => [path, { target: gatewayTarget, changeOrigin: true }]))
  return {
    plugins: [react()],
    server: { proxy: gatewayProxy },
  }
})
