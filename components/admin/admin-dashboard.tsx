'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import {
  Settings,
  Database,
  Users,
  Brain,
  Activity,
  Shield,
  Terminal,
  Zap,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

export function AdminDashboard() {
  const { 
    providers, 
    updateProvider, 
    personas, 
    chats, 
    posts, 
    events,
    ghostMode,
    setGhostMode 
  } = useAppStore()
  
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[HORMULSE] System initialized',
    '[HORMULSE] All AI providers loaded',
    '[HORMULSE] Ready for commands',
  ])

  const addConsoleLog = (message: string) => {
    setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const stats = {
    totalChats: chats.length,
    totalMessages: chats.reduce((acc, chat) => acc + chat.messages.length, 0),
    totalPosts: posts.length,
    totalEvents: events.length,
    activeProviders: providers.filter(p => p.enabled).length,
    totalPersonas: personas.length
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glitch-text">Admin Control Panel</h1>
          <p className="text-muted-foreground mt-1">
            Full system control for HORMULSE AI
          </p>
        </div>
        <Badge variant="outline" className="border-2 border-secondary text-secondary px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Authenticated as Admin
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Chats', value: stats.totalChats, icon: Users },
          { label: 'Messages', value: stats.totalMessages, icon: Activity },
          { label: 'Posts', value: stats.totalPosts, icon: Database },
          { label: 'Events', value: stats.totalEvents, icon: Zap },
          { label: 'Providers', value: stats.activeProviders, icon: Brain },
          { label: 'Personas', value: stats.totalPersonas, icon: Settings },
        ].map(stat => (
          <Card key={stat.label} className="border-2 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="border-2 border-border bg-card p-1">
          <TabsTrigger value="providers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Brain className="h-4 w-4" />
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="console" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Terminal className="h-4 w-4" />
            Console
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* AI Providers */}
        <TabsContent value="providers">
          <Card className="border-4 border-border">
            <CardHeader>
              <CardTitle>AI Provider Configuration</CardTitle>
              <CardDescription>
                Enable or disable AI providers and configure their settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border-2 border-border bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={provider.enabled}
                      onCheckedChange={(checked) => {
                        updateProvider(provider.id, { enabled: checked })
                        addConsoleLog(`Provider ${provider.name} ${checked ? 'enabled' : 'disabled'}`)
                      }}
                    />
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {provider.model}
                      </div>
                    </div>
                  </div>
                  <Badge variant={provider.enabled ? 'default' : 'outline'}>
                    {provider.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-4 border-border">
              <CardHeader>
                <CardTitle>Ghost Mode</CardTitle>
                <CardDescription>
                  When enabled, HORMULSE will automatically reply to discussion posts as a regular user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Ghost Mode</span>
                  <Switch
                    checked={ghostMode}
                    onCheckedChange={(checked) => {
                      setGhostMode(checked)
                      addConsoleLog(`Ghost mode ${checked ? 'enabled' : 'disabled'}`)
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-border">
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Current system status and version info
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-secondary text-secondary-foreground">Online</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created by</span>
                  <a 
                    href="https://portfolioofarman.netlify.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Fardin Arman Rafi
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Console */}
        <TabsContent value="console">
          <Card className="border-4 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  System Console
                </CardTitle>
                <CardDescription>
                  View system logs and execute commands
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setConsoleOutput([])}
                className="gap-2 border-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full border-2 border-border bg-black p-4 font-mono text-sm">
                {consoleOutput.map((line, i) => (
                  <div key={i} className="text-secondary">
                    {line}
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-primary">$</span>
                  <Input
                    placeholder="Enter command..."
                    className="flex-1 border-0 bg-transparent text-foreground focus-visible:ring-0 p-0 h-auto"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        addConsoleLog(`$ ${e.currentTarget.value}`)
                        addConsoleLog(`Command executed: ${e.currentTarget.value}`)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger">
          <Card className="border-4 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions. Proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-destructive/50">
                <div>
                  <div className="font-medium">Clear All Chats</div>
                  <div className="text-sm text-muted-foreground">
                    Remove all conversation history
                  </div>
                </div>
                <Button variant="destructive" className="gap-2 border-2 border-destructive">
                  <Trash2 className="h-4 w-4" />
                  Clear Chats
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border-2 border-destructive/50">
                <div>
                  <div className="font-medium">Clear Discussion Posts</div>
                  <div className="text-sm text-muted-foreground">
                    Remove all posts and replies
                  </div>
                </div>
                <Button variant="destructive" className="gap-2 border-2 border-destructive">
                  <Trash2 className="h-4 w-4" />
                  Clear Posts
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border-2 border-destructive/50">
                <div>
                  <div className="font-medium">Reset Analytics</div>
                  <div className="text-sm text-muted-foreground">
                    Clear all tracked events
                  </div>
                </div>
                <Button variant="destructive" className="gap-2 border-2 border-destructive">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
