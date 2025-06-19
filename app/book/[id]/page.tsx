"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, Building, FileText, ArrowLeft, Save, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { BookShare } from "@/components/book-share"
import type { SavedBook } from "@/types"
import { BookReader } from "@/components/book-reader"

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [book, setBook] = useState<SavedBook | null>(null)
  const [progress, setProgress] = useState(0)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchBook()
    }
  }, [session, params.id])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`)
      if (response.ok) {
        const bookData = await response.json()
        setBook(bookData)
        setProgress(bookData.progress)
        setNotes(bookData.notes || "")
      } else {
        toast({
          title: "Error",
          description: "Book not found",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch book details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBook = async () => {
    if (!book) return

    setSaving(true)
    try {
      const response = await fetch(`/api/books/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress,
          notes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Updated!",
          description: "Book progress and notes saved",
        })
        setBook((prev) => (prev ? { ...prev, progress, notes } : null))
      } else {
        throw new Error("Failed to update book")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!session || !book) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
            <BookShare
              book={book}
              trigger={
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Book
                </Button>
              }
            />
          </div>

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

            {/* Book Details and Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {book.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{book.description.replace(/<[^>]*>/g, "")}</p>
                  </CardContent>
                </Card>
              )}

              {/* Reading Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Reading Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-2xl font-bold text-primary">{progress}%</span>
                    </div>
                    <Slider
                      value={[progress]}
                      onValueChange={(value) => setProgress(value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Not Started</span>
                      <span>Finished</span>
                    </div>
                  </div>

                  {book.pageCount && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {Math.round((progress / 100) * book.pageCount)}
                          </div>
                          <div className="text-sm text-muted-foreground">Pages Read</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-muted-foreground">
                            {book.pageCount - Math.round((progress / 100) * book.pageCount)}
                          </div>
                          <div className="text-sm text-muted-foreground">Pages Left</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>My Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add your thoughts, quotes, or notes about this book..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-between">
                <BookReader
                  book={book}
                  trigger={
                    <Button variant="outline" size="lg" className="px-8">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read Book
                    </Button>
                  }
                />
                <Button onClick={updateBook} disabled={saving} size="lg" className="px-8">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
