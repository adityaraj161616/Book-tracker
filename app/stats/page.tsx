"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp, Target, Calendar } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import type { ReadingStats } from "@/types"

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<ReadingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      } else {
        throw new Error("Failed to fetch stats")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reading statistics",
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

  if (!session || !stats) {
    return null
  }

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Books Read",
      value: stats.booksRead,
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Currently Reading",
      value: stats.booksReading,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "This Month",
      value: stats.booksThisMonth,
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-8">Reading Statistics</h1>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                        <motion.p
                          className="text-3xl font-bold"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                        >
                          {stat.value}
                        </motion.p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reading Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Reading Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-lg font-bold text-primary">{stats.averageProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <motion.div
                        className="bg-primary h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.averageProgress}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <motion.div
                        className="text-2xl font-bold text-primary mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        {stats.pagesRead.toLocaleString()}
                      </motion.div>
                      <div className="text-sm text-muted-foreground">Pages Read</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <motion.div
                        className="text-2xl font-bold text-muted-foreground mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                      >
                        {(stats.totalPages - stats.pagesRead).toLocaleString()}
                      </motion.div>
                      <div className="text-sm text-muted-foreground">Pages Left</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Library Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Library Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Finished</span>
                      </div>
                      <span className="font-semibold">{stats.booksRead}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Currently Reading</span>
                      </div>
                      <span className="font-semibold">{stats.booksReading}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Want to Read</span>
                      </div>
                      <span className="font-semibold">{stats.booksWantToRead}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <motion.div
                        className="text-3xl font-bold text-primary mb-1"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                      >
                        {stats.totalBooks}
                      </motion.div>
                      <div className="text-sm text-muted-foreground">Total Books in Library</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Motivational Section */}
          {stats.totalBooks > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Keep Reading! 📚</h3>
                  <p className="text-muted-foreground">
                    {stats.booksRead === 0
                      ? "Start your first book and begin your reading journey!"
                      : stats.booksReading > 0
                        ? `You're currently reading ${stats.booksReading} book${stats.booksReading > 1 ? "s" : ""}. Keep it up!`
                        : "Time to pick up a new book from your want-to-read list!"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
