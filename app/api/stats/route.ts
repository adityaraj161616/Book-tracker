import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("booktracker")
    const books = await db.collection("books").find({ userEmail: session.user.email }).toArray()

    const totalBooks = books.length
    const booksRead = books.filter((book) => book.shelf === "finished").length
    const booksReading = books.filter((book) => book.shelf === "currently-reading").length
    const booksWantToRead = books.filter((book) => book.shelf === "want-to-read").length

    const totalPages = books.reduce((sum, book) => sum + (book.pageCount || 0), 0)
    const pagesRead = books.reduce((sum, book) => {
      const pages = book.pageCount || 0
      const progress = book.progress || 0
      return sum + Math.round((progress / 100) * pages)
    }, 0)

    const averageProgress = totalBooks > 0 ? books.reduce((sum, book) => sum + (book.progress || 0), 0) / totalBooks : 0

    // Books added this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const booksThisMonth = books.filter((book) => {
      const savedDate = new Date(book.savedAt)
      return savedDate.getMonth() === currentMonth && savedDate.getFullYear() === currentYear
    }).length

    return NextResponse.json({
      totalBooks,
      booksRead,
      booksReading,
      booksWantToRead,
      totalPages,
      pagesRead,
      averageProgress,
      booksThisMonth,
    })
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Could not fetch statistics" }, { status: 500 })
  }
}
