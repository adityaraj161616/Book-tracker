import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server" // Declared the NextRequest variable

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("booktracker")
    const book = await db.collection("books").findOne({
      _id: new ObjectId(params.id),
      userEmail: session.user.email,
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...book,
      id: book._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Get book error:", error)
    return NextResponse.json({ error: "Could not fetch book" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { progress, notes } = body

    const client = await clientPromise
    const db = client.db("booktracker")

    const result = await db.collection("books").updateOne(
      {
        _id: new ObjectId(params.id),
        userEmail: session.user.email,
      },
      {
        $set: {
          progress: progress ?? 0,
          notes: notes ?? "",
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update book error:", error)
    return NextResponse.json({ error: "Could not update book" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("booktracker")

    const result = await db.collection("books").deleteOne({
      _id: new ObjectId(params.id),
      userEmail: session.user.email,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete book error:", error)
    return NextResponse.json({ error: "Could not delete book" }, { status: 500 })
  }
}
