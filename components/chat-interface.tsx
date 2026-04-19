'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { 
  Send, 
  Loader2, 
  User, 
  Bot, 
  Sparkles,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ChatInterface() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { 
    chats, 
    currentChatId, 
    addMessage, 
    addChat,
    personas, 
    activePersona,
    providers,
    trackEvent
  } = useAppStore()
  
  const currentChat = chats.find(c => c.id === currentChatId)
  const currentPersona = personas.find(p => p.id === activePersona)
  const enabledProviders = providers.filter(p => p.enabled)
  
  const [selectedModel, setSelectedModel] = useState(enabledProviders[0]?.model || 'openai/gpt-4o')

  const { messages, input, handleInputChange, handleSubmit, isLoading, reload, setMessages, setInput } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel,
      systemPrompt: currentPersona?.systemPrompt
    },
    initialInput: '',
    onFinish: (message) => {
      if (currentChatId) {
        addMessage(currentChatId, { role: 'assistant', content: message.content, model: selectedModel })
      }
      trackEvent('ai_response', { model: selectedModel, persona: activePersona })
    }
  })

  // Sync messages with current chat
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content
      })))
    } else {
      setMessages([])
    }
  }, [currentChatId, setMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!(input || '').trim()) return
    
    let chatId = currentChatId
    if (!chatId) {
      chatId = addChat()
    }
    
    addMessage(chatId, { role: 'user', content: input })
    handleSubmit(e)
  }

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Model Selector */}
      <div className="p-4 border-b-2 border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Model:</span>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48 border-2 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {enabledProviders.map(provider => (
                <SelectItem key={provider.id} value={provider.model}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {currentPersona && (
          <div className="text-sm text-muted-foreground">
            Persona: <span className="text-secondary font-medium">{currentPersona.name}</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <Bot className="h-20 w-20 text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/20" />
            </div>
            <h2 className="text-2xl font-bold mb-2 glitch-text">Welcome to HORMULSE AI</h2>
            <p className="text-muted-foreground max-w-md">
              Your advanced AI assistant with multi-model orchestration. 
              Start a conversation or select a persona to customize your experience.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
              {['Explain quantum computing', 'Write a creative story', 'Help me code', 'Analyze this data'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="p-3 text-left text-sm border-2 border-border hover:border-primary transition-colors bg-card"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div className={cn(
                  'shrink-0 w-10 h-10 flex items-center justify-center border-2',
                  message.role === 'user' 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-secondary border-secondary text-secondary-foreground'
                )}>
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                
                <div className={cn(
                  'flex-1 max-w-[80%] group',
                  message.role === 'user' ? 'text-right' : 'text-left'
                )}>
                  <div className={cn(
                    'inline-block p-4 border-2',
                    message.role === 'user'
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-card border-border'
                  )}>
                    {message.role === 'assistant' ? (
                      <div className="markdown-content prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="h-7 text-xs"
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reload()}
                        className="h-7 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 flex items-center justify-center border-2 bg-secondary border-secondary text-secondary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 p-4 border-2 border-border bg-card">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">HORMULSE is thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t-2 border-border bg-card">
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-4">
          <Textarea
            value={input ?? ''}
            onChange={handleInputChange}
            placeholder="Ask HORMULSE anything..."
            className="flex-1 min-h-[60px] max-h-[200px] resize-none border-2 border-border bg-muted focus:border-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !(input || '').trim()}
            className="h-auto px-6 border-2 border-primary"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
