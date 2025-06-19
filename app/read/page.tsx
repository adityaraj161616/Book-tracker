"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { ReadingList } from "@/components/reading-list"
import { useToast } from "@/hooks/use-toast"
import type { SavedBook } from "@/types"

export default function ReadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [books, setBooks] = useState<SavedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchBooks()
    }
  }, [session])

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books")
      if (response.ok) {
        const booksData = await response.json()
        setBooks(booksData)
      } else {
        throw new Error("Failed to fetch books")
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
          <ReadingList books={books} />
        </motion.div>
      </div>
    </div>
  )
}
