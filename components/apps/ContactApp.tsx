"use client"

import type React from "react"

import { useState } from "react"

export default function ContactApp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSubmitted(true)
    setIsSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: "", email: "", message: "" })
    }, 3000)
  }

  return (
    <div className="p-6 text-white h-full">
      <h1 className="text-2xl font-bold mb-6 text-green-400">$ ./contact --interactive</h1>

      {submitted && (
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-6">
          <p className="text-green-400">✅ Message sent successfully! I'll get back to you soon.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Send Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                type="text"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                type="email"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                required
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded font-medium transition-colors"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-300">hello@abdull.dev</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-gray-300">+2347033389645</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-medium">Location</p>
                <p className="text-gray-300">Abuja, Nigeria</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-2xl">💼</span>
              <div>
                <p className="font-medium">LinkedIn</p>
                <p className="text-gray-300">linkedin.com/in/abdoulrasheed</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-2xl">🐙</span>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-gray-300">github.com/abdoulrasheed</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Quick Commands</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="bg-gray-800 p-2 rounded">
                <span className="text-green-400">$</span> curl -X POST abdull.dev/contact
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <span className="text-green-400">$</span> ssh abdull@abdull.dev
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <span className="text-green-400">$</span> git clone github.com/abdoulrasheed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
