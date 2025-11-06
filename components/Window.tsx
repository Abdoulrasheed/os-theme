"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import type { WindowType } from "@/lib/WindowContext"
import { useWindowStore } from "@/lib/WindowContext"
import ChatApp from "./apps/ChatApp"
import AboutApp from "./apps/AboutApp"
import ProjectsApp from "./apps/ProjectsApp"
import TerminalApp from "./apps/TerminalApp"
import ResumeApp from "./apps/ResumeApp"
import ContactApp from "./apps/ContactApp"
import PackageManagerApp from "./apps/PackageManagerApp"

interface WindowProps {
  window: WindowType
}

const components = {
  ChatApp,
  AboutApp,
  ProjectsApp,
  TerminalApp,
  ResumeApp,
  ContactApp,
  PackageManagerApp,
}

export default function Window({ window }: WindowProps) {
  const { closeWindow, focusWindow, minimizeWindow, maximizeWindow, updateWindowPosition, updateWindowSize } =
    useWindowStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const Component = components[window.component as keyof typeof components]

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return
    }

    // Calculate offset from mouse position to window's current position
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - window.x,
      y: e.clientY - window.y,
    })
    focusWindow(window.id)
    e.preventDefault()
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height,
    })
    focusWindow(window.id)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.maximized) {
        // Calculate new position based on mouse position minus the initial offset
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Get screen dimensions safely
        const screenWidth = typeof globalThis !== "undefined" && globalThis.innerWidth ? globalThis.innerWidth : 1920
        const screenHeight = typeof globalThis !== "undefined" && globalThis.innerHeight ? globalThis.innerHeight : 1080

        // Constrain to screen bounds
        const maxX = Math.max(0, screenWidth - window.width)
        const maxY = Math.max(0, screenHeight - window.height - 48) // 48px for taskbar

        const constrainedX = Math.max(0, Math.min(maxX, newX))
        const constrainedY = Math.max(0, Math.min(maxY, newY))

        console.log("Dragging:", { newX, newY, constrainedX, constrainedY, dragOffset })
        updateWindowPosition(window.id, constrainedX, constrainedY)
      } else if (isResizing && !window.maximized) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        const newWidth = Math.max(300, resizeStart.width + deltaX)
        const newHeight = Math.max(200, resizeStart.height + deltaY)
        updateWindowSize(window.id, newWidth, newHeight)
      }
    }

    const handleMouseUp = () => {
      console.log("Mouse up - stopping drag")
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, window, updateWindowPosition, updateWindowSize])

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Close button clicked for window:", window.id)
    closeWindow(window.id)
  }

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Minimize button clicked for window:", window.id)
    minimizeWindow(window.id)
  }

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Maximize button clicked for window:", window.id)
    maximizeWindow(window.id)
  }

  if (window.minimized) {
    return null
  }

  // Ensure all values are valid numbers
  const safeX = typeof window.x === "number" && !isNaN(window.x) ? window.x : 0
  const safeY = typeof window.y === "number" && !isNaN(window.y) ? window.y : 0
  const safeWidth = typeof window.width === "number" && !isNaN(window.width) ? window.width : 600
  const safeHeight = typeof window.height === "number" && !isNaN(window.height) ? window.height : 400

  return (
    <motion.div
      ref={windowRef}
      className="absolute bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: window.maximized ? 0 : safeX,
        top: window.maximized ? 0 : safeY,
        width: window.maximized ? "100vw" : safeWidth,
        height: window.maximized ? "calc(100vh - 48px)" : safeHeight,
        zIndex: window.zIndex,
        cursor: isDragging ? "grabbing" : "default",
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={() => focusWindow(window.id)}
    >
      {/* Window Header */}
      <div
        className={`bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <button
              className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"
              onClick={handleClose}
            />
            <button
              className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"
              onClick={handleMinimize}
            />
            <button
              className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"
              onClick={handleMaximize}
            />
          </div>
          <span className="text-white text-sm font-medium ml-2">{window.title}</span>
        </div>
      </div>

      {/* Window Content */}
      <div className="relative" style={{ height: "calc(100% - 40px)" }}>
        <div className="h-full overflow-auto bg-gray-900">{Component && <Component />}</div>

        {/* Resize Handle */}
        {!window.maximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-600 hover:bg-gray-500 transition-colors"
            onMouseDown={handleResizeMouseDown}
            style={{
              clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)",
            }}
          />
        )}
      </div>
    </motion.div>
  )
}
