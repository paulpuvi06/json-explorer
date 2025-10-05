'use client'

import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { useCookieConsent } from '@/lib/use-cookie-consent'

export function ConditionalAnalytics() {
  const { hasConsented, isProduction } = useCookieConsent()

  // Only render analytics if:
  // 1. User has consented to cookies
  // 2. We're in production (not local/Docker)
  if (!hasConsented || !isProduction) {
    return null
  }

  return <Analytics />
}
