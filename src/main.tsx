import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PostHogProvider } from '@posthog/react'
import './index.css'
import App from './App'

// Side-effect: initializes PostHog if VITE_POSTHOG_KEY is set
import './lib/analytics'

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
} as const

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_POSTHOG_KEY} options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
