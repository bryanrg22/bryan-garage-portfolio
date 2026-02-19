import posthog from 'posthog-js'

const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (key) posthog.capture(name, properties)
}

export function setUserProps(properties: Record<string, unknown>) {
  if (key) posthog.setPersonProperties(properties)
}
