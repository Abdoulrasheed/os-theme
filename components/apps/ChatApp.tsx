"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm Abdul. Thanks for stopping by my portfolio! I'd love to tell you about my work, experience, and projects. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [toolsCalled, setToolsCalled] = useState<string[]>([])
  const [summarySent, setSummarySent] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Auto-send summary after 2 minutes of inactivity
  useEffect(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    // Only set timer if there's a meaningful conversation and summary hasn't been sent
    if (messages.length > 1 && !summarySent) {
      inactivityTimerRef.current = setTimeout(() => {
        console.log("Inactivity detected - sending summary")
        sendConversationSummary()
      }, 2 * 60 * 1000) // 2 minutes
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [messages, summarySent])

  // Handle browser tab close / page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (messages.length > 1 && !summarySent) {
        // Use sendBeacon for reliable sending during page unload
        const conversationMessages = messages
          .filter(m => m.id !== "welcome")
          .map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          }))

        if (conversationMessages.length > 0) {
          const payload = JSON.stringify({
            messages: conversationMessages,
            toolsCalled,
            recipientEmail: "abdulrasheedibrahim47@gmail.com",
            previewOnly: false
          })

          // sendBeacon is designed for sending data during page unload
          navigator.sendBeacon("/api/conversation-summary", payload)
          console.log("Summary sent via sendBeacon (tab closing)")
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [messages, toolsCalled, summarySent])

  // Send conversation summary when component unmounts (window closes)
  useEffect(() => {
    return () => {
      // Only send if there was a meaningful conversation (more than just welcome message)
      if (messages.length > 1 && !summarySent) {
        sendConversationSummary()
      }
    }
  }, [messages, toolsCalled, summarySent])

  const sendConversationSummary = async () => {
    if (summarySent) {
      console.log("Summary already sent, skipping")
      return
    }

    try {
      // Prepare messages for summary (exclude system welcome message)
      const conversationMessages = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        }))

      if (conversationMessages.length === 0) return

      console.log("Sending conversation summary...")
      setSummarySent(true)

      // Send to summary API
      await fetch("/api/conversation-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationMessages,
          toolsCalled,
          recipientEmail: "abdulrasheedibrahim47@gmail.com",
          previewOnly: false
        }),
      })

      console.log("Summary sent successfully")
    } catch (error) {
      console.error("Failed to send conversation summary:", error)
      setSummarySent(false) // Allow retry on error
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Call our API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Track tools called
      if (data.toolsCalled && Array.isArray(data.toolsCalled)) {
        setToolsCalled(prev => [...prev, ...data.toolsCalled])
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I apologize, I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Check if conversation seems to be ending (goodbye messages)
      const endingPhrases = ["bye", "thank you", "thanks", "that's all", "that's it", "goodbye", "see you"]
      const continueConversationPhrases = ["tell me something", "something nice", "secret", "one more thing", "what else"]
      
      const userMessageLower = userMessage.content.toLowerCase()
      const assistantMessageLower = (data.message || "").toLowerCase()
      
      const userSaysGoodbye = endingPhrases.some(phrase => userMessageLower.includes(phrase))
      const assistantSaysGoodbye = endingPhrases.some(phrase => assistantMessageLower.includes(phrase))
      const wantsContinuation = continueConversationPhrases.some(phrase => userMessageLower.includes(phrase))

      // Only send goodbye summary if it's actually goodbye, not a continuation request
      if ((userSaysGoodbye || assistantSaysGoodbye) && !wantsContinuation) {
        console.log("Goodbye detected - sending summary in 5 seconds")
        setTimeout(() => {
          sendConversationSummary()
        }, 5000) // Wait 5 seconds after goodbye
      }
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-blue-500/50">
              <AvatarImage src="/myphoto.jpg" alt="Abdul" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                AR
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              Chat with Me
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </h3>
            <p className="text-xs text-gray-400">Always online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/myphoto.jpg" alt="Abdul" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      AR
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`group max-w-[80%] ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700/50"
                  } rounded-2xl px-4 py-3 shadow-lg`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-[10px] opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src="/myphoto.jpg" alt="Abdul" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  AR
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-800 border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about my experience, projects, or availability..."
                className="min-h-[52px] max-h-[200px] resize-none bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl pr-12"
                disabled={isTyping}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                {input.length > 0 && `${input.length} chars`}
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="lg"
              className="h-[52px] w-[52px] rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              "Tell me about your experience",
              "Show me your projects",
              "Are you available for work?",
              "What's your tech stack?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-xs px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-full border border-gray-700/50 transition-colors"
                disabled={isTyping}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
