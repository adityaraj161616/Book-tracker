"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, BookOpen, Clock, CheckCircle, Heart, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BookModal } from "@/components/book-modal"
import { BookShare } from "@/components/book-share"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import type { Book, SavedBook } from "@/types"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchCount, setSearchCount] = useState(0)
  const [lastSearchTime, setLastSearchTime] = useState(0)

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
        description: "Failed to fetch your saved books",
        variant: "destructive",
      })
    }
  }

  const searchBooks = async () => {
    if (!searchQuery.trim()) return

    // Rate limiting check
    const now = Date.now()
    if (now - lastSearchTime < 12000) {
      // 12 seconds between searches
      if (searchCount >= 5) {
        toast({
          title: "Search limit reached",
          description: "You're searching too fast. Please wait a moment.",
          variant: "destructive",
        })
        return
      }
    } else {
      setSearchCount(0)
    }

    setLoading(true)
    setSearchCount((prev) => prev + 1)
    setLastSearchTime(now)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error("Search failed")
      }
      const data = await response.json()
      setSearchResults(data.items || [])
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Books cannot be fetched now, please try again.",
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBook = async (book: Book, shelf: string) => {
    try {
      // Extract the necessary data from the book object
      const bookData = {
        bookId: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        description: book.volumeInfo.description || "",
        thumbnail: book.volumeInfo.imageLinks?.thumbnail || null,
        pageCount: book.volumeInfo.pageCount || 0,
        publishedDate: book.volumeInfo.publishedDate || "",
        publisher: book.volumeInfo.publisher || "",
        shelf,
        progress: 0,
      }

      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Book saved!",
          description: `Added to ${shelf} shelf`,
        })
        fetchSavedBooks()
        setSelectedBook(null)
      } else {
        throw new Error(data.error || "Failed to save book")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not save book. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredBooks = savedBooks.filter((book) => {
    if (activeTab === "all") return true
    return book.shelf === activeTab
  })

  const getShelfIcon = (shelf: string) => {
    switch (shelf) {
      case "want-to-read":
        return <Heart className="h-4 w-4" />
      case "currently-reading":
        return <Clock className="h-4 w-4" />
      case "finished":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
          <h1 className="text-3xl font-bold mb-8">Discover Books</h1>

          {/* Search Section */}
          <div className="mb-8">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchBooks()}
                  className="text-lg py-6"
                />
              </div>
              <Button onClick={searchBooks} disabled={loading} size="lg" className="px-8">
                <Search className="h-5 w-5 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="aspect-[3/4] mb-4 overflow-hidden rounded-lg bg-muted">
                              {book.volumeInfo.imageLinks?.thumbnail ? (
                                <img
                                  src={
                                    book.volumeInfo.imageLinks.thumbnail.replace("http:", "https:") ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt={book.volumeInfo.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{book.volumeInfo.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                              {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                            </p>
                            <Button size="sm" onClick={() => setSelectedBook(book)} className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Library
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* My Library Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">My Library</h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Books</TabsTrigger>
                <TabsTrigger value="want-to-read">Want to Read</TabsTrigger>
                <TabsTrigger value="currently-reading">Reading</TabsTrigger>
                <TabsTrigger value="finished">Finished</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No books found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "all"
                        ? "Start building your library by searching for books above."
                        : `No books in your ${activeTab.replace("-", " ")} shelf yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="aspect-[3/4] mb-4 overflow-hidden rounded-lg bg-muted relative">
                              {book.thumbnail ? (
                                <img
                                  src={book.thumbnail.replace("http:", "https:") || "/placeholder.svg"}
                                  alt={book.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              <Badge className={`absolute top-2 right-2 ${getShelfColor(book.shelf)}`}>
                                {getShelfIcon(book.shelf)}
                                <span className="ml-1 text-xs">
                                  {book.shelf === "want-to-read" && "Want"}
                                  {book.shelf === "currently-reading" && "Reading"}
                                  {book.shelf === "finished" && "Done"}
                                </span>
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{book.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                              {book.authors?.join(", ") || "Unknown Author"}
                            </p>
                            {book.shelf === "currently-reading" && (
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Progress</span>
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
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/book/${book.id}`)}
                                className="flex-1"
                              >
                                View Details
                              </Button>
                              <BookShare
                                book={book}
                                trigger={
                                  <Button size="sm" variant="ghost" className="px-2">
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>

      {/* Book Modal */}
      <BookModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onSave={handleSaveBook}
      />
    </div>
  )
}
