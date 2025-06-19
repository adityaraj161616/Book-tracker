import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${process.env.GOOGLE_BOOKS_API_KEY || ""}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`Google Books API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Process the data to ensure all books have consistent structure
    const processedItems =
      data.items?.map((item: any) => {
        // Ensure volumeInfo exists
        if (!item.volumeInfo) {
          item.volumeInfo = {}
        }

        // Ensure imageLinks exists
        if (!item.volumeInfo.imageLinks) {
          item.volumeInfo.imageLinks = {}
        }

        // Convert HTTP URLs to HTTPS
        if (item.volumeInfo.imageLinks?.thumbnail) {
          item.volumeInfo.imageLinks.thumbnail = item.volumeInfo.imageLinks.thumbnail.replace("http:", "https:")
        }

        return item
      }) || []

    return NextResponse.json({ items: processedItems })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Books cannot be fetched now, please try again." }, { status: 500 })
  }
}
