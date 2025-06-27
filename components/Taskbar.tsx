"use client"

import { useState, useEffect } from "react"
import { useWindowStore } from "@/lib/WindowContext"

export default function Taskbar() {
  const { windows, minimizeWindow, focusWindow, openWindow } = useWindowStore()
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleWindowClick = (windowId: string) => {
    console.log("Taskbar window clicked:", windowId)
    const window = windows.find((w) => w.id === windowId)
    if (window?.minimized) {
      focusWindow(windowId)
    } else {
      minimizeWindow(windowId)
    }
  }

  const handleMenuClick = () => {
    console.log("Menu clicked - opening package manager")
    openWindow("packagemanager")
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-900/90 backdrop-blur border-t border-gray-700 flex items-center justify-between px-4 z-50">
      {/* Start Menu */}
      <div className="flex items-center space-x-4">
        <button
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm transition-colors"
          onClick={handleMenuClick}
        >
          <span className="text-lg">🖥️</span>
          <span>AbdullOS</span>
        </button>
      </div>

      {/* Window Buttons */}
      <div className="flex items-center space-x-2">
        {windows.map((window) => (
          <button
            key={window.id}
            className={`px-3 py-1 rounded text-white text-sm transition-colors ${
              window.minimized ? "bg-gray-600 hover:bg-gray-500 opacity-60" : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => handleWindowClick(window.id)}
          >
            {window.title}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center space-x-4 text-white text-sm">
        <span>{currentTime}</span>
      </div>
    </div>
  )
}
