import { useSyncExternalStore } from 'react'

const portraitQuery = '(orientation: portrait)'

function subscribe(cb: () => void) {
  const mql = window.matchMedia(portraitQuery)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}

function getSnapshot() {
  return window.matchMedia(portraitQuery).matches
}

function getServerSnapshot() {
  return true
}

export function useIsPortrait() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
