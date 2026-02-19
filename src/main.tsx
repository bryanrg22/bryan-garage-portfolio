import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { PostHogProvider } from '@posthog/react'

const options = {
  api_host: 'https://us.i.posthog.com',
  defaults: '2026-01-30',
} as const

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider apiKey="phc_nPFV9kpdIXx6LfhMwskqu0Sjq5OXZ5jHQWHNKd77k94" options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
