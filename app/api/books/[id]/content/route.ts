import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"

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

    // Try to find the book content from various free sources
    const bookContent = await findBookContent(book)

    if (!bookContent) {
      return NextResponse.json({ error: "Book content not available for free reading" }, { status: 404 })
    }

    return NextResponse.json(bookContent)
  } catch (error) {
    console.error("Book content API error:", error)
    return NextResponse.json({ error: "Could not fetch book content" }, { status: 500 })
  }
}

async function findBookContent(book: any) {
  // Check if it's a classic book that might be on Project Gutenberg
  const isClassicBook = checkIfClassicBook(book.title, book.authors)

  if (isClassicBook) {
    return generateClassicBookContent(book)
  }

  // For modern books, we can't provide full content due to copyright
  // Return null so the frontend shows external links
  return null
}

function checkIfClassicBook(title: string, authors: string[]) {
  const titleLower = title.toLowerCase()
  const authorLower = authors?.[0]?.toLowerCase() || ""

  // Classic authors whose works are in public domain
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
    "washington irving",
    "henry james",
    "edith wharton",
    "jack london",
    "robert louis stevenson",
    "bram stoker",
    "mary shelley",
    "alexandre dumas",
    "victor hugo",
    "gustave flaubert",
    "leo tolstoy",
    "fyodor dostoevsky",
    "anton chekhov",
    "william shakespeare",
    "geoffrey chaucer",
    "daniel defoe",
    "jonathan swift",
    "miguel de cervantes",
  ]

  // Classic book titles
  const classicTitles = [
    "pride and prejudice",
    "sense and sensibility",
    "emma",
    "mansfield park",
    "great expectations",
    "oliver twist",
    "david copperfield",
    "a tale of two cities",
    "sherlock holmes",
    "hound of the baskervilles",
    "study in scarlet",
    "adventures of tom sawyer",
    "adventures of huckleberry finn",
    "prince and the pauper",
    "picture of dorian gray",
    "importance of being earnest",
    "time machine",
    "war of the worlds",
    "invisible man",
    "island of dr. moreau",
    "twenty thousand leagues",
    "around the world in eighty days",
    "mysterious island",
    "alice's adventures in wonderland",
    "through the looking glass",
    "jane eyre",
    "wuthering heights",
    "silas marner",
    "middlemarch",
    "tess of the d'urbervilles",
    "jude the obscure",
    "mayor of casterbridge",
    "raven",
    "fall of the house of usher",
    "tell-tale heart",
    "scarlet letter",
    "house of seven gables",
    "moby dick",
    "bartleby",
    "legend of sleepy hollow",
    "rip van winkle",
    "turn of the screw",
    "age of innocence",
    "ethan frome",
    "call of the wild",
    "white fang",
    "treasure island",
    "kidnapped",
    "dr. jekyll and mr. hyde",
    "dracula",
    "frankenstein",
    "three musketeers",
    "count of monte cristo",
    "les miserables",
    "hunchback of notre dame",
    "madame bovary",
    "war and peace",
    "anna karenina",
    "crime and punishment",
    "brothers karamazov",
    "cherry orchard",
    "three sisters",
    "uncle vanya",
    "hamlet",
    "macbeth",
    "romeo and juliet",
    "othello",
    "king lear",
    "canterbury tales",
    "robinson crusoe",
    "gulliver's travels",
    "don quixote",
  ]

  // Check if author is classic
  const isClassicAuthor = classicAuthors.some(
    (author) => authorLower.includes(author) || author.includes(authorLower.split(" ")[0]),
  )

  // Check if title is classic
  const isClassicTitle = classicTitles.some(
    (classic) => titleLower.includes(classic) || classic.includes(titleLower.split(" ").slice(0, 2).join(" ")),
  )

  return isClassicAuthor || isClassicTitle
}

function generateClassicBookContent(book: any) {
  const pages = [
    `${book.title}\n\nBy ${book.authors?.join(", ") || "Unknown Author"}\n\n--- Chapter 1 ---\n\nThis is a sample of classic literature content. In a real implementation, this would contain the actual text from Project Gutenberg.\n\nProject Gutenberg offers over 60,000 free eBooks, primarily consisting of works that are in the public domain in the United States.\n\nClassic works like those by Jane Austen, Charles Dickens, Arthur Conan Doyle, and many others are freely available for reading.\n\nThis reading interface demonstrates how you could read these classic works directly within BookTracker, with features like:\n\n• Adjustable font sizes\n• Light and dark themes\n• Bookmark system\n• Progress tracking\n• Reading position memory`,

    `Chapter 2: The Reading Experience\n\nYou can navigate through the book using the Previous and Next buttons at the bottom of the reader.\n\nThe progress bar at the top shows your current position in the book, and you can update your overall reading progress in your BookTracker library.\n\nBookmarks can be added by clicking the bookmark icon in the top right corner. These are saved locally and you can quickly jump to bookmarked pages from the settings menu.\n\nThe settings panel allows you to customize your reading experience with different font sizes and themes for comfortable reading in any lighting condition.`,

    `Chapter 3: Available Content\n\nFor classic literature (generally works published before 1928 in the United States), full text is often available through Project Gutenberg.\n\nSome examples of available classic works include:\n\n• Pride and Prejudice by Jane Austen\n• Great Expectations by Charles Dickens\n• The Adventures of Sherlock Holmes by Arthur Conan Doyle\n• Adventures of Tom Sawyer by Mark Twain\n• The Picture of Dorian Gray by Oscar Wilde\n• The Time Machine by H.G. Wells\n• Twenty Thousand Leagues Under the Sea by Jules Verne\n• Alice's Adventures in Wonderland by Lewis Carroll\n\nAnd thousands more classic works from literature, philosophy, science, and history.`,

    `Chapter 4: Modern Books\n\nFor books still under copyright protection, BookTracker provides links to legitimate sources where you can:\n\n• Search Project Gutenberg (for classics)\n• Browse Internet Archive (for borrowable books)\n• Check Google Books (for preview pages)\n• Find purchase options at bookstores\n\nThis ensures you always have access to legal reading options while respecting authors' and publishers' rights.\n\nThe goal is to enhance your reading experience while maintaining ethical access to content.`,

    `Final Chapter: Enjoy Reading!\n\nThis concludes the sample reading experience in BookTracker.\n\nWhether you're reading classic literature that's freely available or using the app to track your progress through purchased books, BookTracker helps you:\n\n• Discover new books\n• Track your reading progress\n• Take notes and bookmarks\n• Share recommendations with friends\n• Analyze your reading habits\n• Set and achieve reading goals\n\nHappy reading, and enjoy building your personal library with BookTracker!\n\n--- End of Sample ---`,
  ]

  return {
    title: book.title,
    content: pages,
    totalPages: pages.length,
    currentPage: 1,
    source: "gutenberg" as const,
    downloadUrl: `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title)}`,
  }
}
