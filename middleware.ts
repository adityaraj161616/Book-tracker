import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Define protected routes
  const protectedPaths = ["/dashboard", "/book", "/stats", "/profile"]
  const path = request.nextUrl.pathname

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  if (isProtectedPath && !isAuthenticated) {
    // Redirect to the login page if not authenticated
    const redirectUrl = new URL("/", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/book/:path*", "/stats/:path*", "/profile/:path*"],
}
