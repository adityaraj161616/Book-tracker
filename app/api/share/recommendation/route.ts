import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import clientPromise from "@/lib/mongodb"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookId, rating, message } = body

    const client = await clientPromise
    const db = client.db("booktracker")

    // Create or update recommendation
    const recommendation = {
      bookId,
      userEmail: session.user.email,
      rating: rating || 0,
      message: message || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db
      .collection("recommendations")
      .updateOne({ bookId, userEmail: session.user.email }, { $set: recommendation }, { upsert: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Recommendation API error:", error)
    return NextResponse.json({ error: "Could not save recommendation" }, { status: 500 })
  }
}
