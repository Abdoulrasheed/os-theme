"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface WindowType {
  id: string
  type: string
  title: string
  component: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  minimized: boolean
  maximized: boolean
}

interface WindowContextType {
  windows: WindowType[]
  openWindow: (type: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowType[]>([])
  const [zIndexCounter, setZIndexCounter] = useState(100)

  const getWindowConfig = (type: string) => {
    const configs: Record<string, { title: string; component: string; width: number; height: number }> = {
      chat: { title: "Chat Me", component: "ChatApp", width: 1200, height: 700 },
      about: { title: "About Me", component: "AboutApp", width: 700, height: 500 },
      projects: { title: "Projects", component: "ProjectsApp", width: 900, height: 600 },
      terminal: { title: "Terminal", component: "TerminalApp", width: 800, height: 500 },
      resume: { title: "Resume Viewer", component: "ResumeApp", width: 800, height: 600 },
      contact: { title: "Contact", component: "ContactApp", width: 600, height: 400 },
      packagemanager: { title: "Package Manager", component: "PackageManagerApp", width: 700, height: 500 },
    }
    return configs[type] || { title: "Unknown", component: "DefaultApp", width: 600, height: 400 }
  }

  const openWindow = useCallback(
    (type: string) => {
      console.log("Opening window:", type)
      setWindows((prev) => {
        const existingWindow = prev.find((w) => w.type === type)
        if (existingWindow) {
          console.log("Window exists, focusing:", existingWindow.id)
          const newZIndex = zIndexCounter + 1
          setZIndexCounter(newZIndex)
          return prev.map((w) => (w.id === existingWindow.id ? { ...w, zIndex: newZIndex, minimized: false } : w))
        }

        const config = getWindowConfig(type)
        const newZIndex = zIndexCounter + 1
        
        // Center window on screen
        const centerX = Math.max(0, (window.innerWidth - config.width) / 2)
        const centerY = Math.max(0, (window.innerHeight - config.height) / 2)
        
        const newWindow: WindowType = {
          id: `${type}-${Date.now()}`,
          type,
          title: config.title,
          component: config.component,
          x: centerX,
          y: centerY,
          width: config.width,
          height: config.height,
          zIndex: newZIndex,
          minimized: false,
          maximized: false,
        }

        console.log("Creating new window:", newWindow)
        setZIndexCounter(newZIndex)
        return [...prev, newWindow]
      })
    },
    [zIndexCounter],
  )

  const closeWindow = useCallback((id: string) => {
    console.log("Closing window:", id)
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const focusWindow = useCallback(
    (id: string) => {
      console.log("Focusing window:", id)
      const newZIndex = zIndexCounter + 1
      setZIndexCounter(newZIndex)
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: newZIndex, minimized: false } : w)))
    },
    [zIndexCounter],
  )

  const minimizeWindow = useCallback((id: string) => {
    console.log("Minimizing window:", id)
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)))
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    console.log("Maximizing window:", id)
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)))
  }, [])

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    // Ensure x and y are valid numbers
    const validX = typeof x === "number" && !isNaN(x) ? x : 0
    const validY = typeof y === "number" && !isNaN(y) ? y : 0

    console.log("Updating window position:", id, validX, validY)
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x: validX, y: validY } : w)))
  }, [])

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    // Ensure width and height are valid numbers
    const validWidth = typeof width === "number" && !isNaN(width) ? Math.max(300, width) : 300
    const validHeight = typeof height === "number" && !isNaN(height) ? Math.max(200, height) : 200

    console.log("Updating window size:", id, validWidth, validHeight)
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width: validWidth, height: validHeight } : w)))
  }, [])

  return (
    <WindowContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        maximizeWindow,
        updateWindowPosition,
        updateWindowSize,
      }}
    >
      {children}
    </WindowContext.Provider>
  )
}

export function useWindowStore() {
  const context = useContext(WindowContext)
  if (context === undefined) {
    throw new Error("useWindowStore must be used within a WindowProvider")
  }
  return context
}
