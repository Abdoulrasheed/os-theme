"use client"

import { useState, useEffect } from "react"
import BootScreen from "@/components/BootScreen"
import Desktop from "@/components/Desktop"
import { WindowProvider } from "@/lib/WindowContext"

export default function AbdullOS() {
  const [isBooted, setIsBooted] = useState(false)

  useEffect(() => {
    // Start boot sequence
    const bootTimer = setTimeout(() => {
      setIsBooted(true)
    }, 8000) // 8 seconds for boot sequence

    return () => clearTimeout(bootTimer)
  }, [])

  return (
    <WindowProvider>
      <main className="h-screen w-screen overflow-hidden bg-black font-mono">
        {!isBooted ? <BootScreen /> : <Desktop />}
      </main>
    </WindowProvider>
  )
}
