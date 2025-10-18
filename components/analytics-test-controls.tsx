'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TestTube, Trash2, X } from 'lucide-react'

export function AnalyticsTestControls() {
  const [isTestMode, setIsTestMode] = useState(false)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    const testMode = localStorage.getItem('test-analytics') === 'true'
    const urlHasTestParam = window.location.search.includes('test-analytics=true')
    
    setIsTestMode(testMode || urlHasTestParam)
    setShowControls(urlHasTestParam)
  }, [])

  const enableTestMode = () => {
    localStorage.setItem('test-analytics', 'true')
    localStorage.removeItem('cookie-consent')
    setIsTestMode(true)
    window.location.reload()
  }

  const disableTestMode = () => {
    localStorage.removeItem('test-analytics')
    localStorage.removeItem('cookie-consent')
    setIsTestMode(false)
    window.location.reload()
  }

  const hideControls = () => {
    setShowControls(false)
    // Remove test parameter from URL without reload
    const url = new URL(window.location.href)
    url.searchParams.delete('test-analytics')
    window.history.replaceState({}, '', url.toString())
  }

  // Only show in development and when URL has test parameter
  // During SSR, window is undefined, so we return null
  if (typeof window === 'undefined') return null
  
  // Only show on localhost and when showControls is true
  if (window.location.hostname !== 'localhost' || !showControls) return null

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 p-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TestTube className="h-4 w-4 text-yellow-600" />
          <h3 className="font-semibold text-sm text-yellow-800">Analytics Test Controls</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={hideControls}
          className="h-6 w-6 p-0 hover:bg-yellow-100"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <p className="text-xs text-yellow-700 mb-3">
        Test cookie banner and analytics behavior locally
      </p>
      
      <div className="flex gap-2">
        {!isTestMode ? (
          <Button size="sm" onClick={enableTestMode} className="text-xs">
            Enable Test Mode
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={disableTestMode} className="text-xs">
            <Trash2 className="h-3 w-3 mr-1" />
            Disable Test Mode
          </Button>
        )}
      </div>
      
      {isTestMode && (
        <p className="text-xs text-green-600 mt-2">
          ✅ Test mode active - cookie banner should appear
        </p>
      )}
    </Card>
  )
}