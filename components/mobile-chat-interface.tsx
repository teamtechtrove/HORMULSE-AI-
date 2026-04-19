'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Send, 
  Loader2, 
  User, 
  Bot, 
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function MobileChatInterface() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  
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

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!(input || '').trim()) return
    
    let chatId = currentChatId
    if (!chatId) {
      chatId = addChat()
    }
    
    addMessage(chatId, { role: 'user', content: input })
    handleSubmit(e)
    
    if (inputRef.current) {
      inputRef.current.style.height = '44px'
    }
  }

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e)
    e.target.style.height = '44px'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const suggestions = [
    'Explain quantum computing',
    'Write a creative story',
    'Help me with code',
    'Summarize this topic'
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Model Selector - Compact */}
      <div className="shrink-0 px-3 py-2 border-b-2 border-border bg-card/50 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="h-8 text-xs border-2 border-border flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {enabledProviders.map(provider => (
              <SelectItem key={provider.id} value={provider.model} className="text-xs">
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentPersona && currentPersona.id !== 'default' && (
          <span className="text-[10px] text-secondary truncate max-w-20">
            {currentPersona.name}
          </span>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-4">
              <Bot className="h-16 w-16 text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/20" />
            </div>
            <h2 className="text-lg font-bold mb-1 glitch-text">HORMULSE AI</h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs">
              Your advanced AI assistant with multi-model orchestration.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="p-2.5 text-left text-xs border-2 border-border hover:border-primary transition-colors bg-card active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div className={cn(
                  'shrink-0 w-8 h-8 flex items-center justify-center border-2',
                  message.role === 'user' 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-secondary border-secondary text-secondary-foreground'
                )}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={cn(
                  'flex-1 max-w-[85%]',
                  message.role === 'user' ? 'text-right' : 'text-left'
                )}>
                  <div className={cn(
                    'inline-block p-3 border-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border'
                  )}>
                    {message.role === 'assistant' ? (
                      <div className="markdown-content prose prose-invert prose-sm max-w-none text-xs leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-xs">{message.content}</p>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="mt-1 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="h-6 px-2 text-[10px]"
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reload()}
                        className="h-6 px-2 text-[10px]"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 flex items-center justify-center border-2 bg-secondary border-secondary text-secondary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 p-3 border-2 border-border bg-card">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="default"
          size="icon"
          className="absolute bottom-24 right-4 h-8 w-8 rounded-full border-2 border-primary shadow-lg z-10"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      {/* Input Area */}
      <div className="shrink-0 p-3 border-t-2 border-border bg-card safe-area-bottom">
        <form onSubmit={onSubmit} className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input ?? ''}
            onChange={handleTextareaChange}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 min-h-[44px] max-h-[120px] px-3 py-2.5 text-sm resize-none border-2 border-border bg-muted focus:border-primary focus:outline-none transition-colors"
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
            size="icon"
            className="h-11 w-11 shrink-0 border-2 border-primary"
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
