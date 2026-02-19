import posthog from 'posthog-js'

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  posthog.capture(name, properties)
}

export function setUserProps(properties: Record<string, unknown>) {
  posthog.setPersonProperties(properties)
}
