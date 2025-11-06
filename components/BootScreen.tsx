"use client"

import { useState, useEffect } from "react"

export default function BootScreen() {
  const [bootMessages, setBootMessages] = useState<string[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  const messages = [
    "AbdullOS v2.0 - AI-Powered Portfolio",
    "",
    "Initializing neural networks...",
    "Loading agent orchestration layer...",
    "Activating LangGraph reasoning engine...",
    "Deploying autonomous agents...",
    "Establishing vector memory stores...",
    "Configuring multi-agent workflows...",
    "Syncing knowledge graphs...",
    "Preparing interactive interface...",
    "",
    "All systems operational. Agents standing by.",
    "",
    "Entering workspace...",
  ]

  useEffect(() => {
    let messageIndex = 0

    const typeMessage = async () => {
      if (messageIndex < messages.length) {
        const message = messages[messageIndex]
        setCurrentMessage("")

        for (let i = 0; i <= message.length; i++) {
          setCurrentMessage(message.slice(0, i))
          await new Promise((resolve) => setTimeout(resolve, 1))
        }

        setBootMessages((prev) => [...prev, message])
        messageIndex++

        await new Promise((resolve) => setTimeout(resolve, 5))
        typeMessage()
      }
    }

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    const startTimer = setTimeout(typeMessage, 10)

    return () => {
      clearInterval(cursorInterval)
      clearTimeout(startTimer)
    }
  }, [])

  return (
    <div className="h-screen w-screen bg-black text-green-400 p-8 overflow-hidden">
      <div className="space-y-1">
        {bootMessages.map((message, index) => (
          <div key={index} className="font-mono text-sm">
            {message}
          </div>
        ))}
        <div className="font-mono text-sm">
          {currentMessage}
          <span className={`inline-block w-2 h-4 bg-green-400 ${showCursor ? "opacity-100" : "opacity-0"}`}></span>
        </div>
      </div>
    </div>
  )
}
