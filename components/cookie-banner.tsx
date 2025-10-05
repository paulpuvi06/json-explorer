'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Cookie, X } from 'lucide-react'
import { useCookieConsent } from '@/lib/use-cookie-consent'

export function CookieBanner() {
  const { showBanner, acceptCookies, declineCookies, isProduction } = useCookieConsent()

  // Don't show banner in development/Docker (unless in test mode)
  if (!showBanner || !isProduction) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm">
      <Card className="mx-auto max-w-4xl border-2">
        <div className="flex items-start gap-4 p-6">
          <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              Privacy & Analytics
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We use privacy-friendly analytics to improve your experience and understand site usage. 
              Analytics help us make JSON Explorer better for everyone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={declineCookies}>
                Decline Analytics
              </Button>
              <Button size="sm" onClick={acceptCookies}>
                Accept Analytics
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
