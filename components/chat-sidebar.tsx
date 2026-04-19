'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function ChatSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { chats, currentChatId, addChat, deleteChat, setCurrentChat } = useAppStore()

  const handleNewChat = () => {
    addChat()
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (collapsed) {
    return (
      <div className="w-12 border-r-4 border-border bg-card flex flex-col items-center py-4 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="mb-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={handleNewChat}
          className="border-2 border-primary"
        >
          <Plus className="h-4 w-4" />
        </Button>
        {chats.slice(0, 5).map((chat) => (
          <Button
            key={chat.id}
            variant={currentChatId === chat.id ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setCurrentChat(chat.id)}
            className={cn(
              'border-2',
              currentChatId === chat.id ? 'border-primary' : 'border-transparent'
            )}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="w-64 border-r-4 border-border bg-card flex flex-col">
      <div className="p-4 border-b-2 border-border flex items-center justify-between">
        <Button
          onClick={handleNewChat}
          className="flex-1 gap-2 border-2 border-primary"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
          className="ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No conversations yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  'group flex items-center gap-2 p-3 cursor-pointer border-2 transition-all',
                  currentChatId === chat.id
                    ? 'bg-primary/10 border-primary'
                    : 'border-transparent hover:border-muted hover:bg-muted/50'
                )}
                onClick={() => setCurrentChat(chat.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(chat.updatedAt)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChat(chat.id)
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
