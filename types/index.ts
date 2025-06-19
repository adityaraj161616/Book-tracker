import type { DefaultSession } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

// Book from Google Books API
export interface Book {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    pageCount?: number
    publishedDate?: string
    publisher?: string
    categories?: string[]
    language?: string
    infoLink?: string
  }
}

// Saved book in our database
export interface SavedBook {
  id: string
  bookId: string
  title: string
  authors: string[]
  description?: string
  thumbnail?: string
  pageCount?: number
  publishedDate?: string
  publisher?: string
  shelf: "want-to-read" | "currently-reading" | "finished"
  progress: number
  notes?: string
  savedAt: string
  updatedAt?: string
  userEmail: string
}

// Reading statistics
export interface ReadingStats {
  totalBooks: number
  booksRead: number
  booksReading: number
  booksWantToRead: number
  totalPages: number
  pagesRead: number
  averageProgress: number
  booksThisMonth: number
}
