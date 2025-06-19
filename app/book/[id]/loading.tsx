import { Navbar } from "@/components/navbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 w-32 mb-6">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Cover and Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-[3/4] w-full max-w-[300px] mx-auto mb-6">
                  <Skeleton className="h-full w-full" />
                </div>

                <div className="space-y-4 text-center">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Details and Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-40" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
