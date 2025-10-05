'use client'

import { useState, useEffect } from 'react'

export function useEnvironment() {
  const [isDocker, setIsDocker] = useState(false)
  const [showPersonalBranding, setShowPersonalBranding] = useState(true)

  useEffect(() => {
    // Check if we're running in Docker
    const isDockerEnv = process.env.DISABLE_ANALYTICS === '1' || 
                       window.location.hostname === 'localhost' && 
                       window.location.port === '8080'
    
    setIsDocker(isDockerEnv)
    
    // Show personal branding only when NOT in Docker
    setShowPersonalBranding(!isDockerEnv)
  }, [])

  return {
    isDocker,
    showPersonalBranding
  }
}
