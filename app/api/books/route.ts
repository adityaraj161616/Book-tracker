import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import clientPromise from "@/lib/mongodb"
import type { NextRequest } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("booktracker")
    const books = await db.collection("books").find({ userEmail: session.user.email }).sort({ savedAt: -1 }).toArray()

    return NextResponse.json(
      books.map((book) => ({
        ...book,
        id: book._id.toString(),
        _id: undefined,
      })),
    )
  } catch (error) {
    console.error("Get books error:", error)
    return NextResponse.json({ error: "Could not fetch books" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookId, title, authors, description, thumbnail, pageCount, publishedDate, publisher, shelf, progress } =
      body

    const client = await clientPromise
    const db = client.db("booktracker")

    // Check if book already exists for this user
    const existingBook = await db.collection("books").findOne({
      userEmail: session.user.email,
      bookId,
    })

    if (existingBook) {
      return NextResponse.json({ error: "Book already in library" }, { status: 400 })
    }

    // Ensure thumbnail URL uses HTTPS
    const secureThumbail = thumbnail ? thumbnail.replace("http:", "https:") : null

    const newBook = {
      userEmail: session.user.email,
      bookId,
      title,
      authors: authors || [],
      description,
      thumbnail: secureThumbail,
      pageCount,
      publishedDate,
      publisher,
      shelf,
      progress: progress || 0,
      notes: "",
      savedAt: new Date().toISOString(),
    }

    const result = await db.collection("books").insertOne(newBook)

    return NextResponse.json({
      ...newBook,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Save book error:", error)
    return NextResponse.json({ error: "Could not save book" }, { status: 500 })
  }
}
