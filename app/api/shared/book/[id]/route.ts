import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("booktracker")

    // Get the book
    const book = await db.collection("books").findOne({
      _id: new ObjectId(params.id),
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Get user info
    const user = await db.collection("users").findOne({
      email: book.userEmail,
    })

    // Get recommendation if exists
    const recommendation = await db.collection("recommendations").findOne({
      bookId: params.id,
      userEmail: book.userEmail,
    })

    const sharedBook = {
      id: book._id.toString(),
      title: book.title,
      authors: book.authors || [],
      description: book.description,
      thumbnail: book.thumbnail,
      pageCount: book.pageCount,
      publishedDate: book.publishedDate,
      publisher: book.publisher,
      shelf: book.shelf,
      progress: book.progress,
      sharedBy: {
        name: user?.name || "Anonymous Reader",
        avatar: user?.image,
      },
      recommendation: recommendation
        ? {
            rating: recommendation.rating,
            message: recommendation.message,
            createdAt: recommendation.createdAt,
          }
        : null,
    }

    return NextResponse.json(sharedBook)
  } catch (error) {
    console.error("Shared book API error:", error)
    return NextResponse.json({ error: "Could not fetch shared book" }, { status: 500 })
  }
}
