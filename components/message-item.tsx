"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, ChevronDown, ChevronRight } from "lucide-react"
import { type Message, fetchReplies, createMessage } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface MessageItemProps {
  message: Message
  level?: number
  onReplyAdded?: () => void
}

export default function MessageItem({ message, level = 0, onReplyAdded }: MessageItemProps) {
  const [replies, setReplies] = useState<Message[]>([])
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const { user } = useAuth()

  const loadReplies = async () => {
    if (replies.length === 0 && !message.replies) {
      setIsLoadingReplies(true)
      try {
        const fetchedReplies = await fetchReplies(message.id)
        setReplies(fetchedReplies)
      } catch (error) {
        console.error("Failed to load replies:", error)
      } finally {
        setIsLoadingReplies(false)
      }
    } else if (message.replies && replies.length === 0) {
      // Use the replies that came with the message
      setReplies(message.replies)
    }
    setShowReplies(!showReplies)
  }

  const handleReply = async () => {
    if (!replyContent.trim() || !user) return

    setIsSubmittingReply(true)
    try {
      const newReply = await createMessage({
        content: replyContent,
        parentId: String(message.id),
      })

      setReplies([...replies, newReply])
      setReplyContent("")
      setShowReplyForm(false)
      setShowReplies(true)
      onReplyAdded?.()
    } catch (error) {
      console.error("Failed to post reply:", error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Calculate reply count
  const replyCount = message.replies?.length || message.replyCount || replies.length || 0

  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 16)}` : ""

  return (
    <div className={`${indentClass} ${level > 0 ? "border-l-2 border-gray-200 pl-4" : ""}`}>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{message.username}</p>
              <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </CardContent>

        <CardFooter className="pt-0 flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={loadReplies} disabled={isLoadingReplies}>
            {showReplies ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <MessageCircle className="h-4 w-4 ml-1" />
            {replyCount}
          </Button>

          {user && (
            <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
              Reply
            </Button>
          )}
        </CardFooter>

        {showReplyForm && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleReply} disabled={!replyContent.trim() || isSubmittingReply}>
                  {isSubmittingReply ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyContent("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {showReplies && (
        <div className="space-y-2">
          {isLoadingReplies ? (
            <div className="text-center py-4 text-gray-500">Loading replies...</div>
          ) : (
            replies.map((reply) => (
              <MessageItem key={reply.id} message={reply} level={level + 1} onReplyAdded={onReplyAdded} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
