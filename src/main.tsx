import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { PostHogProvider } from '@posthog/react'

// Hardcoded temporarily to diagnose env var issue
const POSTHOG_KEY = 'phc_yrudU3QY8K3QcYZvruJZ1YyRvxyQ9J7xt5QBOjFBaFK'
const POSTHOG_HOST = 'https://us.i.posthog.com'

console.log('PostHog key from env:', import.meta.env.VITE_PUBLIC_POSTHOG_KEY)
console.log('PostHog host from env:', import.meta.env.VITE_PUBLIC_POSTHOG_HOST)
console.log('PostHog key hardcoded:', POSTHOG_KEY)

const options = {
  api_host: POSTHOG_HOST,
  defaults: '2026-01-30',
} as const

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider apiKey={POSTHOG_KEY} options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
