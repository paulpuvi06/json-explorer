'use client'

import { useState, useEffect } from 'react'

type ConsentStatus = 'pending' | 'accepted' | 'declined'

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>('pending')
  const [showBanner, setShowBanner] = useState(false)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Check if analytics are disabled at build time (Docker builds)
    const isAnalyticsDisabled = process.env.DISABLE_ANALYTICS === '1'
    
    // Check if we're in production (Vercel deployment)
    const isProd = process.env.NODE_ENV === 'production' && 
                   (window.location.hostname.includes('vercel.app') || 
                    window.location.hostname.includes('json-expo'))
    
    // Allow testing locally by checking for test parameter
    const isTestMode = (window.location.search.includes('test-analytics=true') ||
                       localStorage.getItem('test-analytics') === 'true')
    
    // Enable analytics only if not disabled at build time
    setIsProduction((isProd || isTestMode) && !isAnalyticsDisabled)

    // Show banner and check consent only if analytics are enabled
    if ((isProd || isTestMode) && !isAnalyticsDisabled) {
      const savedConsent = localStorage.getItem('cookie-consent') as ConsentStatus
      if (savedConsent) {
        setConsent(savedConsent)
      } else {
        setShowBanner(true)
      }
    } else {
      // Analytics disabled, don't show banner and don't track
      setConsent('declined')
      setShowBanner(false)
    }
  }, [])

  const acceptCookies = () => {
    if (!isProduction) return
    
    localStorage.setItem('cookie-consent', 'accepted')
    setConsent('accepted')
    setShowBanner(false)
  }

  const declineCookies = () => {
    if (!isProduction) return
    
    localStorage.setItem('cookie-consent', 'declined')
    setConsent('declined')
    setShowBanner(false)
  }

  return {
    consent,
    showBanner,
    acceptCookies,
    declineCookies,
    hasConsented: consent === 'accepted' && isProduction,
    isProduction
  }
}
