"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useWindowStore } from "@/lib/WindowContext"

interface HistoryEntry {
  type: "command" | "output"
  content: string | string[]
}

export default function TerminalApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [currentCommand, setCurrentCommand] = useState("")
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { openWindow } = useWindowStore()

  const commands: Record<string, () => string[]> = {
    help: () => [
      "Available commands:",
      "  help          - Show this help message",
      "  ls            - List directory contents",
      "  cat <file>    - Display file contents",
      "  cd <dir>      - Change directory",
      "  whoami        - Display current user",
      "  uname         - System information",
      "  ps            - Show running processes",
      "  install <pkg> - Install a package",
      "  clear         - Clear terminal",
      "  contact       - Show contact information",
      "  skills        - Display technical skills",
      "  projects      - List recent projects",
      "  open <app>    - Open application",
      "  curl <url>    - Open URL in new tab",
      "  ssh <host>    - Connect to remote host",
    ],
    ls: () => [
      "total 8",
      "drwxr-xr-x  2 abdull abdull 4096 Dec 27 23:17 projects/",
      "drwxr-xr-x  2 abdull abdull 4096 Dec 27 23:17 skills/",
      "-rw-r--r--  1 abdull abdull  256 Dec 27 23:17 about.txt",
      "-rw-r--r--  1 abdull abdull  128 Dec 27 23:17 contact.txt",
      "-rw-r--r--  1 abdull abdull  512 Dec 27 23:17 resume.pdf",
    ],
    whoami: () => ["abdull"],
    uname: () => ["AbdullOS 2.0 x86_64 GNU/Linux"],
    ps: () => [
      "PID  COMMAND",
      "1    /sbin/init",
      "42   portfolio-server",
      "128  python-interpreter",
      "256  react-native-dev",
      "512  django-server",
      "1024 terminal",
    ],
    clear: () => {
      setHistory([])
      return []
    },
    contact: () => [
      "Contact Information:",
      "  Email: hello@abdull.dev",
      "  Phone: +2347033389645",
      "  Location: Abuja, Nigeria",
      "  LinkedIn: linkedin.com/in/abdoulrasheed",
      "  GitHub: github.com/abdull",
    ],
    skills: () => [
      "Technical Skills:",
      "  Languages: Python (Senior), C (Senior), JavaScript (Senior)",
      "  Frameworks: Django (Senior), React (Senior), FastAPI (Experienced)",
      "  Databases: PostgreSQL (Senior), MySQL (Senior), Redis (Intermediate)",
      "  Cloud: AWS (Intermediate), Azure (Comfortable)",
      "  Tools: Linux (Expert), Docker, Kubernetes, Git",
    ],
    projects: () => [
      "Recent Projects:",
      "  • MyHives Platform - Microservices architecture (Python, AWS)",
      "  • Isofy NAC System - Network access control (Django, GraphQL)",
      "  • JobPro Services - Scalable backend architecture",
      "  • Crypto Mining Backend - Blockchain integration (Web3, Python)",
    ],
  }

  const openUrl = (url: string) => {
    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    window.open(url, "_blank", "noopener,noreferrer")
    return [`✅ Opening ${url} in new tab...`]
  }

  const executeCommand = (cmd: string) => {
    const [command, ...args] = cmd.trim().split(" ")

    if (command === "") return []

    if (command === "curl") {
      const url = args[0]
      if (!url) {
        return ["Usage: curl <url>", "Examples:", "  curl github.com/abdull", "  curl linkedin.com/in/abdoulrasheed"]
      }

      // Handle special shortcuts
      const shortcuts: Record<string, string> = {
        "github.com": "https://github.com/abdoulrasheed",
        github: "https://github.com/abdoulrasheed",
        "linkedin.com": "https://linkedin.com/in/abdoulrasheed",
        linkedin: "https://linkedin.com/in/abdoulrasheed",
        "abdull.dev": "https://www.abdull.dev",
        portfolio: "https://www.abdull.dev",
        "twitter.com": "https://twitter.com/aiibrahim3",
        twitter: "https://twitter.com/aiibrahim3",
      }

      const targetUrl = shortcuts[url] || url
      return openUrl(targetUrl)
    }

    if (command === "ssh") {
      const host = args[0]
      if (!host) {
        return ["Usage: ssh <host>", "Examples:", "  ssh github.com", "  ssh abdull.dev"]
      }

      // Handle SSH shortcuts that open relevant URLs
      const sshShortcuts: Record<string, string> = {
        "github.com": "https://github.com/abdull",
        "abdull.dev": "https://www.abdull.dev",
        "linkedin.com": "https://linkedin.com/in/abdoulrasheed",
      }

      if (sshShortcuts[host]) {
        return openUrl(sshShortcuts[host])
      } else {
        return [`ssh: connect to host ${host} port 22: Connection refused`, "💡 Try: ssh github.com or ssh abdull.dev"]
      }
    }

    if (command === "cat") {
      const file = args[0]
      if (file === "about.txt") {
        console.log("Terminal: Opening about app")
        openWindow("about")
        return ["✅ Opening About Me application..."]
      } else if (file === "contact.txt") {
        console.log("Terminal: Opening contact app")
        openWindow("contact")
        return ["✅ Opening Contact application..."]
      } else if (file === "resume.pdf") {
        console.log("Terminal: Opening resume app")
        openWindow("resume")
        return ["✅ Opening Resume Viewer..."]
      } else {
        return [`cat: ${file}: No such file or directory`]
      }
    }

    if (command === "open") {
      const app = args[0]
      const appMap: Record<string, string> = {
        about: "about",
        projects: "projects",
        terminal: "terminal",
        resume: "resume",
        contact: "contact",
        packages: "packagemanager",
        packagemanager: "packagemanager",
      }

      if (appMap[app]) {
        console.log("Terminal: Opening app", app)
        openWindow(appMap[app])
        return [`✅ Opening ${app} application...`]
      } else {
        return [`open: ${app}: Application not found`]
      }
    }

    if (command === "cd") {
      const dir = args[0]
      if (dir === "projects") {
        console.log("Terminal: Opening projects app")
        openWindow("projects")
        return ["✅ Opening Projects directory..."]
      }
      return [`Changed directory to ${dir || "~"}`]
    }

    if (command === "install") {
      const pkg = args[0]
      if (pkg) {
        console.log("Terminal: Opening package manager")
        openWindow("packagemanager")
        return [`✅ Opening Package Manager...`, `Search for: ${pkg}`]
      } else {
        return ["Usage: install <package-name>"]
      }
    }

    if (commands[command]) {
      return commands[command]()
    }

    return [`Command not found: ${command}. Type 'help' for available commands.`]
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const output = executeCommand(currentCommand)
      setHistory((prev) => [...prev, { type: "command", content: `abdull@abdullos:~$ ${currentCommand}` }])

      if (output.length > 0) {
        setHistory((prev) => [...prev, { type: "output", content: output }])
      }

      setCurrentCommand("")

      // Scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
      }, 0)
    }
  }

  useEffect(() => {
    setHistory([
      { type: "output", content: ["Welcome to AbdullOS Terminal v2.0"] },
      { type: "output", content: ['Type "help" for available commands.'] },
      { type: "output", content: ["Try: cat resume.pdf, curl github.com, or ssh abdull.dev"] },
      { type: "output", content: [""] },
    ])

    // Focus input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }, [])

  return (
    <div
      ref={terminalRef}
      className="h-full bg-black text-green-400 p-4 font-mono text-sm overflow-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((entry, index) => (
        <div key={index}>
          {entry.type === "command" ? (
            <div className="text-blue-400">{entry.content}</div>
          ) : Array.isArray(entry.content) ? (
            entry.content.map((line, lineIndex) => (
              <div key={lineIndex} className="text-green-400">
                {line}
              </div>
            ))
          ) : (
            <div className="text-green-400">{entry.content}</div>
          )}
        </div>
      ))}

      <div className="flex items-center">
        <span className="text-blue-400">abdull@abdullos:~$ </span>
        <input
          ref={inputRef}
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-green-400 flex-1 ml-1"
        />
      </div>
    </div>
  )
}
