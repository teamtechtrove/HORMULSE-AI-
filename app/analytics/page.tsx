'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  Activity,
  MessageSquare,
  Users,
  Brain,
  TrendingUp,
  Zap,
  ArrowLeft
} from 'lucide-react'

const COLORS = ['#ff0055', '#00ffaa', '#7c3aed', '#00aaff', '#ffaa00']

export default function AnalyticsPage() {
  const { events, chats, posts, providers } = useAppStore()

  const stats = useMemo(() => {
    const now = Date.now()
    const day = 86400000
    const week = day * 7

    const eventsToday = events.filter(e => now - e.timestamp < day).length
    const eventsThisWeek = events.filter(e => now - e.timestamp < week).length
    const totalMessages = chats.reduce((acc, chat) => acc + chat.messages.length, 0)
    
    const eventTypes = events.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const eventTypeData = Object.entries(eventTypes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const activityData = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * day
      const dayEnd = dayStart + day
      const count = events.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd).length
      return {
        day: new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' }),
        events: count
      }
    })

    const modelUsage = events
      .filter(e => e.type === 'ai_response' && e.data.model)
      .reduce((acc, e) => {
        const model = e.data.model as string
        acc[model] = (acc[model] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const modelData = Object.entries(modelUsage)
      .map(([name, value]) => ({ name: name.split('/')[1] || name, value }))

    return {
      eventsToday,
      eventsThisWeek,
      totalMessages,
      totalChats: chats.length,
      totalPosts: posts.length,
      activeProviders: providers.filter(p => p.enabled).length,
      eventTypeData,
      activityData,
      modelData
    }
  }, [events, chats, posts, providers])

  const recentEvents = useMemo(() => {
    return events.slice(-10).reverse()
  }, [events])

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 h-14 border-b-4 border-primary flex items-center px-3 gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <span className="font-bold">Analytics</span>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Today', value: stats.eventsToday, icon: Zap, color: 'text-primary' },
            { label: 'Week', value: stats.eventsThisWeek, icon: TrendingUp, color: 'text-secondary' },
            { label: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-primary' },
            { label: 'Chats', value: stats.totalChats, icon: Users, color: 'text-secondary' },
            { label: 'Posts', value: stats.totalPosts, icon: Activity, color: 'text-primary' },
            { label: 'Models', value: stats.activeProviders, icon: Brain, color: 'text-secondary' },
          ].map(stat => (
            <Card key={stat.label} className="border-2 border-border">
              <CardContent className="p-2.5 text-center">
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <Card className="border-2 border-border">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={stats.activityData}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} width={20} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111118', 
                    border: '2px solid #2a2a3a',
                    borderRadius: 0,
                    fontSize: 12
                  }}
                />
                <Area type="monotone" dataKey="events" stroke="#ff0055" strokeWidth={2} fill="url(#colorEvents)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Types & Model Usage */}
        <div className="grid grid-cols-2 gap-3">
          {/* Event Types */}
          <Card className="border-2 border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs">Events</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {stats.eventTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie data={stats.eventTypeData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value">
                      {stats.eventTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>

          {/* Model Usage */}
          <Card className="border-2 border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs">Models</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {stats.modelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={stats.modelData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="#888" fontSize={8} width={50} tickLine={false} axisLine={false} />
                    <Bar dataKey="value" fill="#00ffaa" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-xs text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="border-2 border-border">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm">Recent Events</CardTitle>
            <CardDescription className="text-xs">Latest activity</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {recentEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-4 text-xs">
                No events yet
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-2 border border-border bg-muted/50 text-xs">
                    <Badge variant="outline" className="border-primary text-primary font-mono text-[10px] h-5">
                      {event.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
