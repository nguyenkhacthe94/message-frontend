"use client"

import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/login-form"
import MessageBoard from "@/components/message-board"

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return user ? <MessageBoard /> : <LoginForm />
}
