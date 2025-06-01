"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { type Message, fetchMessages } from "@/lib/api"
import MessageItem from "./message-item"
import ComposeMessage from "./compose-message"

export default function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const fetchedMessages = await fetchMessages()
      setMessages(fetchedMessages)
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">MessageBoard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}!</span>
            <Button variant="ghost" size="sm" onClick={loadMessages}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <ComposeMessage onMessagePosted={loadMessages} />

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No messages yet. Be the first to post!</div>
          ) : (
            messages.map((message) => <MessageItem key={message.id} message={message} onReplyAdded={loadMessages} />)
          )}
        </div>
      </main>
    </div>
  )
}
