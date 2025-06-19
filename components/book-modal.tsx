"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Building, FileText } from "lucide-react"

interface Book {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail: string
    }
    pageCount?: number
    publishedDate?: string
    publisher?: string
  }
}

interface BookModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onSave: (book: Book, shelf: string) => void
}

export function BookModal({ book, isOpen, onClose, onSave }: BookModalProps) {
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null)

  const shelves = [
    { id: "want-to-read", label: "Want to Read", color: "bg-red-500" },
    { id: "currently-reading", label: "Currently Reading", color: "bg-yellow-500" },
    { id: "finished", label: "Finished", color: "bg-green-500" },
  ]

  const handleSave = () => {
    if (book && selectedShelf) {
      onSave(book, selectedShelf)
      setSelectedShelf(null)
    }
  }

  if (!book) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Library</DialogTitle>
          <DialogDescription>Choose which shelf to add this book to</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Book Cover and Basic Info */}
          <div className="space-y-4">
            <div className="aspect-[3/4] w-full max-w-[200px] mx-auto overflow-hidden rounded-lg bg-muted">
              {book.volumeInfo.imageLinks?.thumbnail ? (
                <img
                  src={book.volumeInfo.imageLinks.thumbnail.replace("http:", "https:") || "/placeholder.svg"}
                  alt={book.volumeInfo.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-lg">{book.volumeInfo.title}</h3>
              <p className="text-muted-foreground">{book.volumeInfo.authors?.join(", ") || "Unknown Author"}</p>
            </div>
          </div>

          {/* Book Details and Shelf Selection */}
          <div className="space-y-6">
            {/* Book Metadata */}
            <div className="space-y-3">
              {book.volumeInfo.publisher && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{book.volumeInfo.publisher}</span>
                </div>
              )}

              {book.volumeInfo.publishedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{book.volumeInfo.publishedDate}</span>
                </div>
              )}

              {book.volumeInfo.pageCount && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{book.volumeInfo.pageCount} pages</span>
                </div>
              )}
            </div>

            {/* Description */}
            {book.volumeInfo.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {book.volumeInfo.description.replace(/<[^>]*>/g, "")}
                </p>
              </div>
            )}

            {/* Shelf Selection */}
            <div>
              <h4 className="font-semibold mb-3">Choose a shelf:</h4>
              <div className="space-y-2">
                {shelves.map((shelf) => (
                  <motion.div key={shelf.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant={selectedShelf === shelf.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedShelf(shelf.id)}
                    >
                      <div className={`w-3 h-3 rounded-full ${shelf.color} mr-3`} />
                      {shelf.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!selectedShelf} className="flex-1">
                Add to Library
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
