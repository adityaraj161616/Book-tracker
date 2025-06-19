"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Download, Globe, ExternalLink, Info } from "lucide-react"
import { BookReader } from "@/components/book-reader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SavedBook } from "@/types"

interface ReadingListProps {
  books: SavedBook[]
}

export function ReadingList({ books }: ReadingListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredBooks, setFilteredBooks] = useState<SavedBook[]>([])

  useEffect(() => {
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.authors?.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredBooks(filtered)
  }, [books, searchQuery])

  const getAvailabilityStatus = (book: SavedBook) => {
    const title = book.title.toLowerCase()
    const author = book.authors?.[0]?.toLowerCase() || ""

    // Classic authors whose works are likely in public domain
    const classicAuthors = [
      "jane austen",
      "charles dickens",
      "arthur conan doyle",
      "mark twain",
      "oscar wilde",
      "h.g. wells",
      "jules verne",
      "lewis carroll",
      "charlotte bronte",
      "emily bronte",
      "george eliot",
      "thomas hardy",
      "edgar allan poe",
      "nathaniel hawthorne",
      "herman melville",
      "bram stoker",
      "mary shelley",
      "alexandre dumas",
      "victor hugo",
      "leo tolstoy",
      "fyodor dostoevsky",
      "william shakespeare",
    ]

    // Classic book titles
    const classicTitles = [
      "pride and prejudice",
      "sense and sensibility",
      "emma",
      "great expectations",
      "oliver twist",
      "david copperfield",
      "sherlock holmes",
      "hound of the baskervilles",
      "adventures of tom sawyer",
      "huckleberry finn",
      "picture of dorian gray",
      "time machine",
      "war of the worlds",
      "twenty thousand leagues",
      "around the world in eighty days",
      "alice's adventures in wonderland",
      "jane eyre",
      "wuthering heights",
      "treasure island",
      "dr. jekyll and mr. hyde",
      "dracula",
      "frankenstein",
    ]

    // Check if it's a classic book
    const isClassicAuthor = classicAuthors.some(
      (classic) => author.includes(classic) || classic.includes(author.split(" ")[0]),
    )

    const isClassicTitle = classicTitles.some(
      (classic) => title.includes(classic) || classic.includes(title.split(" ").slice(0, 2).join(" ")),
    )

    if (isClassicAuthor || isClassicTitle) {
      return {
        status: "available",
        source: "Classic Literature",
        color: "bg-green-500",
        description: "Available for reading (Public Domain)",
      }
    }

    // Modern books - check for common ones that might have previews
    const commonModernBooks = [
      "harry potter",
      "lord of the rings",
      "game of thrones",
      "hunger games",
      "twilight",
      "fifty shades",
      "da vinci code",
      "girl with the dragon tattoo",
    ]

    const hasPreview = commonModernBooks.some(
      (modern) => title.includes(modern) || modern.includes(title.split(" ")[0]),
    )

    if (hasPreview) {
      return {
        status: "preview",
        source: "Preview Available",
        color: "bg-yellow-500",
        description: "Limited preview available",
      }
    }

    return {
      status: "external",
      source: "External Links",
      color: "bg-blue-500",
      description: "Check external sources",
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reading Library</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Reading Availability:</strong> Classic literature (pre-1928) is available for full reading. Modern
          books show external links to legitimate sources. All content respects copyright laws.
        </AlertDescription>
      </Alert>

      {/* Availability Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reading Availability Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium">Available for Reading</div>
                <div className="text-muted-foreground">Classic literature in public domain</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <div className="font-medium">Preview Available</div>
                <div className="text-muted-foreground">Limited preview content</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <div className="font-medium">External Sources</div>
                <div className="text-muted-foreground">Links to legitimate reading platforms</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => {
          const availability = getAvailabilityStatus(book)

          return (
            <Card key={book.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
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

                    <Badge variant="secondary" className={`text-xs mb-2 text-white ${availability.color}`}>
                      {availability.source}
                    </Badge>

                    <p className="text-xs text-muted-foreground mb-3">{availability.description}</p>

                    <div className="space-y-2">
                      {availability.status === "available" ? (
                        <BookReader
                          book={book}
                          trigger={
                            <Button size="sm" className="w-full">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Read Now
                            </Button>
                          }
                        />
                      ) : availability.status === "preview" ? (
                        <BookReader
                          book={book}
                          trigger={
                            <Button size="sm" variant="outline" className="w-full">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          }
                        />
                      ) : (
                        <div className="space-y-1">
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <a
                              href={`https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title + " " + (book.authors?.[0] || ""))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Project Gutenberg
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <a
                              href={`https://archive.org/search.php?query=${encodeURIComponent(book.title + " " + (book.authors?.[0] || ""))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Internet Archive
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <a
                              href={`https://books.google.com/books?q=${encodeURIComponent(book.title + " " + (book.authors?.[0] || ""))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Google Books
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "Add some books to your library to start reading"}
          </p>
        </div>
      )}
    </div>
  )
}
