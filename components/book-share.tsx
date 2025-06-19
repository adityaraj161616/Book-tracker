"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Twitter, Facebook, Linkedin, Copy, Mail, MessageCircle, Star, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { SavedBook } from "@/types"

interface BookShareProps {
  book: SavedBook
  trigger?: React.ReactNode
}

export function BookShare({ book, trigger }: BookShareProps) {
  const { toast } = useToast()
  const [customMessage, setCustomMessage] = useState("")
  const [rating, setRating] = useState(0)

  const shareUrl = `${window.location.origin}/shared/book/${book.id}`
  const defaultMessage = `I just ${book.shelf === "finished" ? "finished reading" : "started reading"} "${book.title}" by ${book.authors?.join(", ")}. Check it out!`

  const shareData = {
    title: book.title,
    text: customMessage || defaultMessage,
    url: shareUrl,
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast({
          title: "Shared successfully!",
          description: "Book shared via native sharing",
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleSocialShare = (platform: string) => {
    const message = encodeURIComponent(customMessage || defaultMessage)
    const url = encodeURIComponent(shareUrl)

    let shareLink = ""

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${message}&url=${url}`
        break
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${message}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${message}`
        break
      case "whatsapp":
        shareLink = `https://wa.me/?text=${message}%20${url}`
        break
      case "email":
        shareLink = `mailto:?subject=${encodeURIComponent(book.title)}&body=${message}%20${url}`
        break
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400")
    }
  }

  const generateRecommendation = async () => {
    try {
      const response = await fetch("/api/share/recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book.id,
          rating,
          message: customMessage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Recommendation created!",
          description: "Your book recommendation has been saved",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create recommendation",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Book</DialogTitle>
          <DialogDescription>Share this book with friends and fellow readers</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Book Preview */}
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                    {book.thumbnail ? (
                      <img
                        src={book.thumbnail.replace("http:", "https:") || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{book.authors?.join(", ") || "Unknown Author"}</p>
                    <Badge variant="secondary" className="text-xs">
                      {book.shelf === "finished"
                        ? "Finished"
                        : book.shelf === "currently-reading"
                          ? "Reading"
                          : "Want to Read"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Rate this book</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 rounded ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            {/* Custom Message */}
            <div>
              <label className="text-sm font-medium mb-2 block">Custom message</label>
              <Textarea
                placeholder={defaultMessage}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Share Link */}
            <div>
              <label className="text-sm font-medium mb-2 block">Share link</label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={handleCopyLink} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <label className="text-sm font-medium mb-2 block">Share on social media</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleSocialShare("twitter")}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleSocialShare("facebook")}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleSocialShare("linkedin")}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => handleSocialShare("whatsapp")}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => handleSocialShare("email")}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button onClick={handleNativeShare} variant="outline" size="sm" className="justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  More
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={generateRecommendation} className="flex-1">
                Create Recommendation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
