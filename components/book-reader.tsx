"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  ExternalLink,
  FileText,
  Globe,
  Bookmark,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SavedBook } from "@/types"

interface BookReaderProps {
  book: SavedBook
  trigger?: React.ReactNode
}

interface BookContent {
  title: string
  content: string[]
  totalPages: number
  currentPage: number
  source: "gutenberg" | "archive" | "preview" | "sample" | "unavailable"
  downloadUrl?: string
  previewUrl?: string
}

export function BookReader({ book, trigger }: BookReaderProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [bookContent, setBookContent] = useState<BookContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [fontSize, setFontSize] = useState(16)
  const [theme, setTheme] = useState("light")
  const [bookmarks, setBookmarks] = useState<number[]>([])

  useEffect(() => {
    if (isOpen && !bookContent && !error) {
      fetchBookContent()
    }
  }, [isOpen])

  const fetchBookContent = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/books/${book.id}/content`)

      if (response.ok) {
        const content = await response.json()
        setBookContent(content)

        // Load saved reading position
        const savedPage = localStorage.getItem(`book-${book.id}-page`)
        if (savedPage) {
          setCurrentPage(Number.parseInt(savedPage))
        }

        // Load bookmarks
        const savedBookmarks = localStorage.getItem(`book-${book.id}-bookmarks`)
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks))
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Book content not available")
      }
    } catch (error: any) {
      console.error("Failed to fetch book content:", error)
      setError(error.message || "Failed to load book content")

      // Generate sample content as fallback
      const sampleContent = generateSampleContent(book)
      setBookContent(sampleContent)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleContent = (book: SavedBook): BookContent => {
    const pages = [
      `${book.title}\n\nBy ${book.authors?.join(", ") || "Unknown Author"}\n\n--- Sample Content ---\n\nThis is a sample reading experience for "${book.title}". \n\nIn a real implementation, this book would be loaded from free sources like Project Gutenberg (for public domain books), Internet Archive, or Google Books preview.\n\nCurrently, this book is not available in our free content sources, but you can:\n\n• Search for it on Project Gutenberg if it's a classic\n• Check Internet Archive for borrowable copies\n• Use Google Books for preview pages\n• Purchase from your preferred bookstore`,

      `Chapter 1: Getting Started\n\nThis is the second page of sample content. You can navigate between pages using the Previous and Next buttons below.\n\nFeatures of this reader:\n• Adjustable font size\n• Light and dark themes\n• Bookmark system\n• Progress tracking\n• Reading position memory\n\nThe reader automatically saves your progress and syncs it with your BookTracker library.`,

      `Chapter 2: Reading Experience\n\nYou can customize your reading experience using the settings button in the top right corner.\n\nBookmarks can be added by clicking the bookmark icon. Your bookmarks will be saved and you can quickly navigate to them from the settings panel.\n\nThe progress bar at the top shows your reading progress through the book, and you can update your overall book progress using the "Update Progress" button.`,

      `Chapter 3: Finding Books\n\nFor books that are available for free reading:\n\n• Classic literature (pre-1928) is often available on Project Gutenberg\n• Many books can be borrowed from Internet Archive\n• Google Books offers preview pages for many titles\n\nThis sample demonstrates the reading interface. Real content would be loaded from these legitimate free sources when available.`,

      `Final Page\n\nThis concludes the sample reading experience.\n\nTo read actual books:\n1. Look for books marked as "Available for reading"\n2. Try the external links for books not available in-app\n3. Check Project Gutenberg for classic literature\n4. Use Internet Archive for borrowable books\n\nEnjoy your reading journey with BookTracker!`,
    ]

    return {
      title: book.title,
      content: pages,
      totalPages: pages.length,
      currentPage: 1,
      source: "sample",
    }
  }

  const handlePageChange = (page: number) => {
    if (bookContent && page >= 1 && page <= bookContent.totalPages) {
      setCurrentPage(page)
      localStorage.setItem(`book-${book.id}-page`, page.toString())
    }
  }

  const toggleBookmark = () => {
    const newBookmarks = bookmarks.includes(currentPage)
      ? bookmarks.filter((p) => p !== currentPage)
      : [...bookmarks, currentPage].sort((a, b) => a - b)

    setBookmarks(newBookmarks)
    localStorage.setItem(`book-${book.id}-bookmarks`, JSON.stringify(newBookmarks))

    toast({
      title: bookmarks.includes(currentPage) ? "Bookmark removed" : "Bookmark added",
      description: `Page ${currentPage}`,
    })
  }

  const getReadingProgress = () => {
    if (!bookContent) return 0
    return Math.round((currentPage / bookContent.totalPages) * 100)
  }

  const updateReadingProgress = async () => {
    const progress = getReadingProgress()
    try {
      await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress }),
      })
      toast({
        title: "Progress updated",
        description: `${progress}% complete`,
      })
    } catch (error) {
      console.error("Failed to update progress:", error)
    }
  }

  const renderContent = () => {
    if (!bookContent) return null

    const pageContent = bookContent.content[currentPage - 1] || "Page not found"

    return (
      <div
        className={`prose max-w-none ${theme === "dark" ? "prose-invert" : ""}`}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
      >
        <div className="whitespace-pre-wrap leading-relaxed p-4">{pageContent}</div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Read Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{book.title}</span>
            <div className="flex items-center gap-2">
              {bookContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBookmark}
                  className={bookmarks.includes(currentPage) ? "text-yellow-500" : ""}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reading Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        min={12}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>12px</span>
                        <span>{fontSize}px</span>
                        <span>24px</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Theme</label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {bookmarks.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Bookmarks</label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {bookmarks.map((page) => (
                            <Button
                              key={page}
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-full justify-start text-xs"
                            >
                              Page {page}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DialogTitle>
          <DialogDescription>
            {book.authors?.join(", ")} •{" "}
            {bookContent?.source === "sample"
              ? "Sample Content"
              : bookContent?.source === "gutenberg"
                ? "Project Gutenberg"
                : bookContent?.source === "archive"
                  ? "Internet Archive"
                  : "Preview"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading book content...</p>
            </div>
          </div>
        ) : bookContent ? (
          <div className="flex flex-col h-[70vh]">
            {/* Error Alert */}
            {error && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error} - Showing sample content instead.</AlertDescription>
              </Alert>
            )}

            {/* Reading Progress */}
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reading Progress</span>
                <span className="text-sm text-muted-foreground">{getReadingProgress()}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getReadingProgress()}%` }}
                />
              </div>
            </div>

            {/* Content Area */}
            <div
              className={`flex-1 overflow-y-auto rounded-lg border ${
                theme === "dark" ? "bg-gray-900 text-white border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {renderContent()}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-4 p-4 bg-muted/50 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {bookContent.totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={updateReadingProgress}>
                  Update Progress
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= bookContent.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Book Not Available for Reading</h3>
            <p className="text-muted-foreground mb-6">
              This book is not available for in-app reading, but you can try these alternatives:
            </p>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <a
                  href={`https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title + " " + (book.authors?.[0] || ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Search Project Gutenberg
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a
                  href={`https://archive.org/search.php?query=${encodeURIComponent(book.title + " " + (book.authors?.[0] || ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Search Internet Archive
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a
                  href={`https://books.google.com/books?q=${encodeURIComponent(book.title + " " + (book.authors?.[0] || ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Books Preview
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
