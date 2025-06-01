"use client"

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

  const handleSubmit = async () => {
    if (!content.trim()) return

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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>What's on your mind?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Message"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
