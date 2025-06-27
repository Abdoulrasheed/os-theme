"use client"

import { useState, useCallback } from "react"

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

export function useWindowStore() {
  const [windows, setWindows] = useState<WindowType[]>([])
  const [zIndexCounter, setZIndexCounter] = useState(100)

  const getWindowConfig = (type: string) => {
    const configs: Record<string, { title: string; component: string; width: number; height: number }> = {
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
      setWindows((prev) => {
        const existingWindow = prev.find((w) => w.type === type)
        if (existingWindow) {
          // Focus existing window
          return prev.map((w) =>
            w.id === existingWindow.id ? { ...w, zIndex: zIndexCounter + 1, minimized: false } : w,
          )
        }

        const config = getWindowConfig(type)
        const newWindow: WindowType = {
          id: `${type}-${Date.now()}`,
          type,
          title: config.title,
          component: config.component,
          x: 100 + prev.length * 30,
          y: 100 + prev.length * 30,
          width: config.width,
          height: config.height,
          zIndex: zIndexCounter + 1,
          minimized: false,
          maximized: false,
        }

        setZIndexCounter((prev) => prev + 1)
        return [...prev, newWindow]
      })
    },
    [zIndexCounter],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: zIndexCounter + 1, minimized: false } : w)))
      setZIndexCounter((prev) => prev + 1)
    },
    [zIndexCounter],
  )

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)))
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)))
  }, [])

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)))
  }, [])

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width, height } : w)))
  }, [])

  return {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  }
}
