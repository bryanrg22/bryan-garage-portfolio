import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import './index.css'
import App from './App'

// Side-effect: initializes PostHog if VITE_POSTHOG_KEY is set
import './lib/analytics'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
