"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, Building, FileText, Star, Heart, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SharedBook {
  id: string
  title: string
  authors: string[]
  description?: string
  thumbnail?: string
  pageCount?: number
  publishedDate?: string
  publisher?: string
  shelf: string
  progress: number
  sharedBy: {
    name: string
    avatar?: string
  }
  recommendation?: {
    rating: number
    message: string
    createdAt: string
  }
}

export default function SharedBookPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [book, setBook] = useState<SharedBook | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSharedBook()
  }, [params.id])

  const fetchSharedBook = async () => {
    try {
      const response = await fetch(`/api/shared/book/${params.id}`)
      if (response.ok) {
        const bookData = await response.json()
        setBook(bookData)
      } else {
        toast({
          title: "Book not found",
          description: "This shared book could not be found",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shared book",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getShelfColor = (shelf: string) => {
    switch (shelf) {
      case "want-to-read":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "currently-reading":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "finished":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    }
  }

  const getShelfLabel = (shelf: string) => {
    switch (shelf) {
      case "want-to-read":
        return "Want to Read"
      case "currently-reading":
        return "Currently Reading"
      case "finished":
        return "Finished"
      default:
        return shelf
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
          <p className="text-muted-foreground mb-4">This shared book could not be found.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">BookTracker</span>
            </div>
            <Button asChild>
              <Link href="/">
                <ExternalLink className="h-4 w-4 mr-2" />
                Join BookTracker
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Shared by banner */}
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  {book.sharedBy.avatar ? (
                    <img
                      src={book.sharedBy.avatar || "/placeholder.svg"}
                      alt={book.sharedBy.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-semibold">{book.sharedBy.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    <span className="text-primary">{book.sharedBy.name}</span> shared this book with you
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {book.shelf === "finished"
                      ? "They finished reading this book"
                      : book.shelf === "currently-reading"
                        ? "They're currently reading this book"
                        : "They want to read this book"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Book Cover and Basic Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-[3/4] w-full max-w-[300px] mx-auto overflow-hidden rounded-lg bg-muted mb-6">
                    {book.thumbnail ? (
                      <img
                        src={book.thumbnail.replace("http:", "https:") || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-20 w-20 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
                      <p className="text-lg text-muted-foreground">{book.authors?.join(", ") || "Unknown Author"}</p>
                    </div>

                    <Badge className={getShelfColor(book.shelf)}>{getShelfLabel(book.shelf)}</Badge>

                    {book.shelf === "currently-reading" && (
                      <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>Reading Progress</span>
                          <span>{book.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-3 text-sm">
                      {book.publisher && (
                        <div className="flex items-center justify-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{book.publisher}</span>
                        </div>
                      )}

                      {book.publishedDate && (
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{book.publishedDate}</span>
                        </div>
                      )}

                      {book.pageCount && (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{book.pageCount} pages</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Book Details and Recommendation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommendation */}
              {book.recommendation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      {book.sharedBy.name}'s Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= book.recommendation!.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">({book.recommendation.rating}/5)</span>
                      </div>
                      {book.recommendation.message && (
                        <div>
                          <p className="text-sm font-medium mb-2">Review:</p>
                          <p className="text-muted-foreground italic">"{book.recommendation.message}"</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Shared on {new Date(book.recommendation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {book.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About This Book</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{book.description.replace(/<[^>]*>/g, "")}</p>
                  </CardContent>
                </Card>
              )}

              {/* Call to Action */}
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Start Your Reading Journey</h3>
                  <p className="text-muted-foreground mb-4">
                    Join BookTracker to track your reading progress, discover new books, and share recommendations with
                    friends.
                  </p>
                  <Button asChild size="lg">
                    <Link href="/">Join BookTracker Free</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
