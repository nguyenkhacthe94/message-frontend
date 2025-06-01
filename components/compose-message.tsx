"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createMessage } from "@/lib/api"

interface ComposeMessageProps {
  onMessagePosted: () => void
}

export default function ComposeMessage({ onMessagePosted }: ComposeMessageProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const MIN_LENGTH = 3
  const MAX_LENGTH = 200
  const remainingChars = MAX_LENGTH - content.length
  const isValidLength = content.length >= MIN_LENGTH && content.length <= MAX_LENGTH

  const handleSubmit = async () => {
    if (!isValidLength) return

    setIsSubmitting(true)
    try {
      await createMessage({ content })
      setContent("")
      onMessagePosted()
    } catch (error) {
      console.error("Failed to post message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isValidLength) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const getCharCountColor = () => {
    if (content.length < MIN_LENGTH) return "text-gray-500"
    if (remainingChars < 20) return "text-red-500"
    if (remainingChars < 50) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>What's on your mind?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Share your thoughts... (Vietnamese supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`min-h-[120px] resize-none ${
              content.length > 0 && !isValidLength
                ? "border-red-500 focus:border-red-500"
                : content.length >= MIN_LENGTH
                  ? "border-green-500 focus:border-green-500"
                  : ""
            }`}
            maxLength={MAX_LENGTH}
          />
          <div className={`absolute bottom-3 right-3 text-sm ${getCharCountColor()}`}>
            {content.length}/{MAX_LENGTH}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {content.length < MIN_LENGTH ? (
              <span>Minimum {MIN_LENGTH - content.length} more characters needed</span>
            ) : (
              <span className="text-green-600">✓ Ready to post</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Ctrl+Enter to post</span>
            <Button
              onClick={handleSubmit}
              disabled={!isValidLength || isSubmitting}
              className={isValidLength ? "" : "opacity-50 cursor-not-allowed"}
            >
              {isSubmitting ? "Posting..." : "Post Message"}
            </Button>
          </div>
        </div>

        {content.length > 0 && content.length < MIN_LENGTH && (
          <p className="text-sm text-red-600">Message must be at least {MIN_LENGTH} characters long</p>
        )}

        {content.length > MAX_LENGTH && (
          <p className="text-sm text-red-600">
            Message is too long. Please shorten it by {content.length - MAX_LENGTH} characters.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
