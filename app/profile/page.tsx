"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BookOpen, LogOut, Trash2, Calendar, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import type { SavedBook } from "@/types"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSavedBooks()
    }
  }, [session])

  const fetchSavedBooks = async () => {
    try {
      const response = await fetch("/api/books")
      if (response.ok) {
        const books = await response.json()
        setSavedBooks(books)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your books",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSavedBooks((prev) => prev.filter((book) => book.id !== bookId))
        toast({
          title: "Book removed",
          description: "Book has been removed from your library",
        })
      } else {
        throw new Error("Failed to delete book")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove book. Please try again.",
        variant: "destructive",
      })
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
        return "Reading"
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

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-8">Profile</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="h-24 w-24 mx-auto">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="text-2xl">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="text-xl font-bold">{session.user?.name}</h2>
                      <p className="text-muted-foreground">{session.user?.email}</p>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Member since {new Date().getFullYear()}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{savedBooks.length} books in library</span>
                      </div>
                    </div>

                    <Separator />

                    <Button variant="destructive" onClick={() => signOut()} className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Books List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Books ({savedBooks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedBooks.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No books yet</h3>
                      <p className="text-muted-foreground mb-4">Start building your library by searching for books.</p>
                      <Button onClick={() => router.push("/dashboard")}>Browse Books</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedBooks.map((book, index) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
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
                            <h3 className="font-semibold truncate">{book.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {book.authors?.join(", ") || "Unknown Author"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getShelfColor(book.shelf)}>{getShelfLabel(book.shelf)}</Badge>
                              {book.shelf === "currently-reading" && (
                                <span className="text-xs text-muted-foreground">{book.progress}% complete</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Added {new Date(book.savedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/book/${book.id}`)}>
                              View
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Book</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove "{book.title}" from your library? This action cannot
                                    be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteBook(book.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
