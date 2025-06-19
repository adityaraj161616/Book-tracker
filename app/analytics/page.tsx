"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Target, Award, BarChart3, LucidePieChart, Activity, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Pie, // Declare the Pie variable here
} from "recharts"
import type { SavedBook } from "@/types"

interface AnalyticsData {
  monthlyProgress: Array<{
    month: string
    booksRead: number
    pagesRead: number
    averageProgress: number
  }>
  genreDistribution: Array<{
    genre: string
    count: number
    percentage: number
  }>
  readingStreak: {
    current: number
    longest: number
    lastActivity: string
  }
  yearlyGoals: {
    booksGoal: number
    pagesGoal: number
    booksProgress: number
    pagesProgress: number
  }
  readingSpeed: {
    averagePagesPerDay: number
    averageTimePerBook: number
    fastestBook: string
    slowestBook: string
  }
  topAuthors: Array<{
    author: string
    booksRead: number
    totalPages: number
  }>
  readingHabits: {
    favoriteGenre: string
    averageBookLength: number
    completionRate: number
    mostProductiveMonth: string
  }
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0", "#ffb347"]

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [books, setBooks] = useState<SavedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const [analyticsResponse, booksResponse] = await Promise.all([fetch("/api/analytics"), fetch("/api/books")])

      if (analyticsResponse.ok && booksResponse.ok) {
        const [analyticsData, booksData] = await Promise.all([analyticsResponse.json(), booksResponse.json()])
        setAnalytics(analyticsData)
        setBooks(booksData)
      } else {
        throw new Error("Failed to fetch analytics")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reading analytics",
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

  if (!session || !analytics) {
    return null
  }

  const insightCards = [
    {
      title: "Reading Streak",
      value: `${analytics.readingStreak.current} days`,
      subtitle: `Longest: ${analytics.readingStreak.longest} days`,
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Completion Rate",
      value: `${analytics.readingHabits.completionRate}%`,
      subtitle: "Books finished vs started",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Reading Speed",
      value: `${analytics.readingSpeed.averagePagesPerDay} pages/day`,
      subtitle: `${analytics.readingSpeed.averageTimePerBook} days per book`,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Favorite Genre",
      value: analytics.readingHabits.favoriteGenre,
      subtitle: `Avg book: ${analytics.readingHabits.averageBookLength} pages`,
      icon: Award,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Reading Analytics</h1>
            <Button onClick={() => router.push("/analytics/goals")} variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {insightCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                            <p className="text-2xl font-bold mb-1">{card.value}</p>
                            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                          </div>
                          <div className={`p-3 rounded-full ${card.bgColor}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Monthly Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Monthly Reading Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.monthlyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="booksRead"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="pagesRead"
                          stackId="2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Genre Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LucidePieChart className="h-5 w-5" />
                      Genre Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={analytics.genreDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ genre, percentage }) => `${genre} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.genreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Reading Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reading Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={analytics.monthlyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="booksRead" stroke="#8884d8" strokeWidth={3} name="Books Read" />
                        <Line
                          type="monotone"
                          dataKey="averageProgress"
                          stroke="#82ca9d"
                          strokeWidth={3}
                          name="Average Progress %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Authors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Authors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analytics.topAuthors} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="author" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="booksRead" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Reading Habits Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Reading Habits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Most Productive Month</p>
                      <p className="text-lg font-semibold">{analytics.readingHabits.mostProductiveMonth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Book Length</p>
                      <p className="text-lg font-semibold">{analytics.readingHabits.averageBookLength} pages</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${analytics.readingHabits.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.readingHabits.completionRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reading Speed Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Reading Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pages per Day</p>
                      <p className="text-lg font-semibold">{analytics.readingSpeed.averagePagesPerDay}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Days per Book</p>
                      <p className="text-lg font-semibold">{analytics.readingSpeed.averageTimePerBook}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fastest Read</p>
                      <p className="text-sm font-medium text-green-600">{analytics.readingSpeed.fastestBook}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      📚 Bookworm: Read 10+ books
                    </Badge>
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      🔥 Streak Master: 7+ day streak
                    </Badge>
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      🎯 Goal Crusher: Met monthly goal
                    </Badge>
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      📖 Speed Reader: 50+ pages/day
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Books Goal */}
                <Card>
                  <CardHeader>
                    <CardTitle>Books Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-lg font-bold">
                          {analytics.yearlyGoals.booksProgress} / {analytics.yearlyGoals.booksGoal}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((analytics.yearlyGoals.booksProgress / analytics.yearlyGoals.booksGoal) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {analytics.yearlyGoals.booksGoal - analytics.yearlyGoals.booksProgress} books remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pages Goal */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pages Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-lg font-bold">
                          {analytics.yearlyGoals.pagesProgress.toLocaleString()} /{" "}
                          {analytics.yearlyGoals.pagesGoal.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4">
                        <div
                          className="bg-green-500 h-4 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((analytics.yearlyGoals.pagesProgress / analytics.yearlyGoals.pagesGoal) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(analytics.yearlyGoals.pagesGoal - analytics.yearlyGoals.pagesProgress).toLocaleString()} pages
                        remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
