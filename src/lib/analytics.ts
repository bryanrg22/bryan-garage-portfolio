import posthog from 'posthog-js'

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined

if (key) {
  posthog.init(key, {
    api_host: (import.meta.env.VITE_POSTHOG_HOST as string) || 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
  })
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (key) posthog.capture(name, properties)
}

export function setUserProps(properties: Record<string, unknown>) {
  if (key) posthog.setPersonProperties(properties)
}
