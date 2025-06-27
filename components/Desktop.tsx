"use client"

import Taskbar from "./Taskbar"
import Window from "./Window"
import { useWindowStore } from "@/lib/WindowContext"

export default function Desktop() {
  const { windows, openWindow } = useWindowStore()

  const desktopApps = [
    { id: "about", name: "About Me", icon: "👨‍💻", color: "bg-blue-500" },
    { id: "projects", name: "Projects", icon: "🚀", color: "bg-green-500" },
    { id: "terminal", name: "Terminal", icon: "⚡", color: "bg-gray-800" },
    { id: "resume", name: "Resume", icon: "📄", color: "bg-orange-500" },
    { id: "contact", name: "Contact", icon: "📧", color: "bg-red-500" },
    { id: "packagemanager", name: "Packages", icon: "📦", color: "bg-purple-500" },
  ]

  const handleAppClick = (appId: string) => {
    console.log("Desktop app clicked:", appId)
    openWindow(appId)
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Desktop Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-8 left-8 space-y-4">
        {desktopApps.map((app) => (
          <button
            key={app.id}
            className="flex flex-col items-center p-2 rounded hover:bg-white/10 transition-colors"
            onClick={() => handleAppClick(app.id)}
          >
            <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center mb-2`}>
              <span className="text-white text-xl">{app.icon}</span>
            </div>
            <span className="text-white text-xs">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}

      {/* Taskbar */}
      <Taskbar />
    </div>
  )
}
