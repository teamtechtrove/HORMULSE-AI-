'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Key,
  Eye,
  EyeOff,
  Plus,
  Save,
  Check,
  X
} from 'lucide-react'

type Tab = 'overview' | 'providers' | 'api-settings' | 'settings' | 'console' | 'danger'

export default function AdminPage() {
  const router = useRouter()
  const { 
    isAdmin, 
    providers, 
    updateProvider, 
    addProvider,
    deleteProvider,
    personas, 
    chats, 
    posts, 
    events, 
    ghostMode, 
    setGhostMode,
    apiSettings,
    updateAPISettings
  } = useAppStore()
  
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [newProvider, setNewProvider] = useState({ name: '', model: '', apiKey: '', baseUrl: '' })
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[HORMULSE] System initialized',
    '[HORMULSE] All AI providers loaded',
  ])

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  const addConsoleLog = (message: string) => {
    setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSaveAPIKey = (providerId: string, apiKey: string) => {
    setSaveStatus('saving')
    updateProvider(providerId, { apiKey })
    addConsoleLog(`API key saved for ${providers.find(p => p.id === providerId)?.name}`)
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 500)
  }

  const handleAddProvider = () => {
    if (newProvider.name && newProvider.model) {
      addProvider({
        name: newProvider.name,
        model: newProvider.model,
        apiKey: newProvider.apiKey,
        baseUrl: newProvider.baseUrl || undefined,
        enabled: false
      })
      addConsoleLog(`Added new provider: ${newProvider.name}`)
      setNewProvider({ name: '', model: '', apiKey: '', baseUrl: '' })
      setShowAddProvider(false)
    }
  }

  const stats = {
    totalChats: chats.length,
    totalMessages: chats.reduce((acc, chat) => acc + chat.messages.length, 0),
    totalPosts: posts.length,
    totalEvents: events.length,
    activeProviders: providers.filter(p => p.enabled).length,
    totalPersonas: personas.length,
    configuredKeys: providers.filter(p => p.apiKey && p.apiKey.length > 0).length
  }

  // API Settings Sub-page
  if (activeTab === 'api-settings') {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="shrink-0 h-14 border-b-4 border-primary flex items-center px-3 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab('overview')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold">API Configuration</span>
          {saveStatus === 'saved' && (
            <Badge className="ml-auto bg-secondary text-secondary-foreground text-xs">
              <Check className="h-3 w-3 mr-1" /> Saved
            </Badge>
          )}
        </header>
        <div className="flex-1 overflow-y-auto p-3 space-y-4 safe-area-bottom">
          {/* Global Settings */}
          <Card className="border-2 border-primary">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Global Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Default Provider</label>
                <Select 
                  value={apiSettings.defaultProvider} 
                  onValueChange={(v) => updateAPISettings({ defaultProvider: v })}
                >
                  <SelectTrigger className="h-10 border-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.filter(p => p.enabled).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-muted-foreground">Max Tokens</label>
                  <span className="text-xs font-mono text-primary">{apiSettings.maxTokens}</span>
                </div>
                <Slider
                  value={[apiSettings.maxTokens]}
                  onValueChange={([v]) => updateAPISettings({ maxTokens: v })}
                  min={256}
                  max={16384}
                  step={256}
                  className="py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-muted-foreground">Temperature</label>
                  <span className="text-xs font-mono text-primary">{apiSettings.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[apiSettings.temperature * 10]}
                  onValueChange={([v]) => updateAPISettings({ temperature: v / 10 })}
                  min={0}
                  max={20}
                  step={1}
                  className="py-2"
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">Streaming</div>
                  <div className="text-xs text-muted-foreground">Enable real-time responses</div>
                </div>
                <Switch
                  checked={apiSettings.streamingEnabled}
                  onCheckedChange={(v) => updateAPISettings({ streamingEnabled: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider API Keys */}
          <Card className="border-2 border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Provider API Keys
              </CardTitle>
              <CardDescription className="text-xs">
                Keys are stored permanently until changed by admin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              {providers.map(provider => (
                <div key={provider.id} className="border-2 border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${provider.apiKey ? 'bg-secondary' : 'bg-muted'}`} />
                      <span className="font-medium text-sm">{provider.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={provider.enabled ? 'default' : 'outline'} className="text-[10px]">
                        {provider.enabled ? 'Active' : 'Off'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteProvider(provider.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs font-mono text-muted-foreground">
                    Model: {provider.model}
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={visibleKeys[provider.id] ? 'text' : 'password'}
                        placeholder="Enter API key..."
                        value={provider.apiKey || ''}
                        onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                        className="h-9 text-sm border-2 border-border pr-10 font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={() => toggleKeyVisibility(provider.id)}
                      >
                        {visibleKeys[provider.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => handleSaveAPIKey(provider.id, provider.apiKey)}
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  {provider.baseUrl && (
                    <div className="text-xs text-muted-foreground">
                      Base URL: {provider.baseUrl}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">Enable provider</span>
                    <Switch
                      checked={provider.enabled}
                      onCheckedChange={(checked) => {
                        updateProvider(provider.id, { enabled: checked })
                        addConsoleLog(`${provider.name} ${checked ? 'enabled' : 'disabled'}`)
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {/* Add New Provider */}
              {showAddProvider ? (
                <div className="border-2 border-dashed border-primary p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-primary">New Provider</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAddProvider(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Provider name (e.g., OpenRouter)"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider(p => ({ ...p, name: e.target.value }))}
                    className="h-9 text-sm border-2 border-border"
                  />
                  <Input
                    placeholder="Model ID (e.g., openrouter/auto)"
                    value={newProvider.model}
                    onChange={(e) => setNewProvider(p => ({ ...p, model: e.target.value }))}
                    className="h-9 text-sm border-2 border-border font-mono"
                  />
                  <Input
                    type="password"
                    placeholder="API Key"
                    value={newProvider.apiKey}
                    onChange={(e) => setNewProvider(p => ({ ...p, apiKey: e.target.value }))}
                    className="h-9 text-sm border-2 border-border font-mono"
                  />
                  <Input
                    placeholder="Base URL (optional)"
                    value={newProvider.baseUrl}
                    onChange={(e) => setNewProvider(p => ({ ...p, baseUrl: e.target.value }))}
                    className="h-9 text-sm border-2 border-border font-mono"
                  />
                  <Button onClick={handleAddProvider} className="w-full h-9">
                    <Plus className="h-4 w-4 mr-2" /> Add Provider
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-10 border-2 border-dashed border-border"
                  onClick={() => setShowAddProvider(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Custom Provider
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card className="border-2 border-border">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Configured Keys</span>
                  <span className="font-mono text-primary">{stats.configuredKeys}/{providers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Providers</span>
                  <span className="font-mono text-secondary">{stats.activeProviders}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Providers Sub-page (simplified, redirects to API settings for full config)
  if (activeTab === 'providers') {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="shrink-0 h-14 border-b-4 border-primary flex items-center px-3 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab('overview')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold">AI Providers</span>
        </header>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {providers.map(provider => (
            <div key={provider.id} className="flex items-center justify-between p-3 border-2 border-border bg-card">
              <div className="flex items-center gap-3">
                <Switch
                  checked={provider.enabled}
                  onCheckedChange={(checked) => {
                    updateProvider(provider.id, { enabled: checked })
                    addConsoleLog(`${provider.name} ${checked ? 'enabled' : 'disabled'}`)
                  }}
                />
                <div>
                  <div className="font-medium text-sm">{provider.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{provider.model}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${provider.apiKey ? 'bg-secondary' : 'bg-destructive/50'}`} />
                <Badge variant={provider.enabled ? 'default' : 'outline'} className="text-xs">
                  {provider.enabled ? 'Active' : 'Off'}
                </Badge>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full mt-4 border-2 border-primary"
            onClick={() => setActiveTab('api-settings')}
          >
            <Key className="h-4 w-4 mr-2" /> Configure API Keys
          </Button>
        </div>
      </div>
    )
  }

  if (activeTab === 'settings') {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="shrink-0 h-14 border-b-4 border-primary flex items-center px-3 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab('overview')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold">Settings</span>
        </header>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <Card className="border-2 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Ghost Mode</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Auto-reply to discussions as AI</div>
                </div>
                <Switch checked={ghostMode} onCheckedChange={(checked) => { setGhostMode(checked); addConsoleLog(`Ghost mode ${checked ? 'on' : 'off'}`) }} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">System Info</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-secondary text-secondary-foreground text-xs">Online</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creator</span>
                <a href="https://portfolioofarman.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-primary">Arman Rafi</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (activeTab === 'console') {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="shrink-0 h-14 border-b-4 border-primary flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveTab('overview')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-bold">Console</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setConsoleOutput([])}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-3 bg-black font-mono text-xs">
          {consoleOutput.map((line, i) => (
            <div key={i} className="text-secondary py-0.5">{line}</div>
          ))}
        </div>
        <div className="shrink-0 p-3 border-t-2 border-border bg-black safe-area-bottom">
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono">$</span>
            <Input
              placeholder="Enter command..."
              className="flex-1 border-0 bg-transparent text-foreground focus-visible:ring-0 h-9 font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  addConsoleLog(`$ ${e.currentTarget.value}`)
                  addConsoleLog(`Executed: ${e.currentTarget.value}`)
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === 'danger') {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="shrink-0 h-14 border-b-4 border-destructive flex items-center px-3 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab('overview')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold text-destructive">Danger Zone</span>
        </header>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {[
            { label: 'Clear All Chats', desc: 'Remove conversation history', icon: Trash2 },
            { label: 'Clear Posts', desc: 'Remove all discussions', icon: Trash2 },
            { label: 'Reset Analytics', desc: 'Clear tracked events', icon: RefreshCw },
            { label: 'Reset API Keys', desc: 'Clear all saved API keys', icon: Key },
          ].map(item => (
            <Card key={item.label} className="border-2 border-destructive/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <Button variant="destructive" size="sm" className="h-8">
                  <item.icon className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Overview
  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <header className="shrink-0 h-14 border-b-4 border-primary flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-bold">Admin Panel</span>
        </div>
        <Badge variant="outline" className="border-secondary text-secondary text-xs">
          <Shield className="h-3 w-3 mr-1" /> Admin
        </Badge>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Chats', value: stats.totalChats, icon: Users },
            { label: 'Messages', value: stats.totalMessages, icon: Activity },
            { label: 'Posts', value: stats.totalPosts, icon: Database },
            { label: 'Events', value: stats.totalEvents, icon: Zap },
            { label: 'Providers', value: stats.activeProviders, icon: Brain },
            { label: 'API Keys', value: stats.configuredKeys, icon: Key },
          ].map(stat => (
            <Card key={stat.label} className="border-2 border-border">
              <CardContent className="p-2.5 text-center">
                <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {[
            { id: 'api-settings' as Tab, label: 'API Configuration', desc: 'Manage keys & settings', icon: Key, highlight: true },
            { id: 'providers' as Tab, label: 'AI Providers', desc: 'Toggle providers', icon: Brain },
            { id: 'settings' as Tab, label: 'Settings', desc: 'Ghost mode & info', icon: Settings },
            { id: 'console' as Tab, label: 'System Console', desc: 'View logs', icon: Terminal },
            { id: 'danger' as Tab, label: 'Danger Zone', desc: 'Destructive actions', icon: AlertTriangle, danger: true },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 border-2 transition-all active:scale-98 ${
                item.danger 
                  ? 'border-destructive/50 hover:border-destructive' 
                  : item.highlight
                    ? 'border-primary bg-primary/5 hover:bg-primary/10'
                    : 'border-border hover:border-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.danger ? 'text-destructive' : 'text-primary'}`} />
                <div className="text-left">
                  <div className={`font-medium text-sm ${item.danger ? 'text-destructive' : ''}`}>{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
