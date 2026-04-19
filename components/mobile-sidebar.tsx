'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus, MessageSquare, Trash2, X } from 'lucide-react'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { chats, currentChatId, addChat, deleteChat, setCurrentChat } = useAppStore()

  const handleNewChat = () => {
    addChat()
    onClose()
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId)
    onClose()
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 bg-black/60 z-40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          'fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-card border-r-4 border-primary z-50 flex flex-col transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-14 px-3 border-b-2 border-border flex items-center justify-between shrink-0">
          <span className="font-bold text-sm">Chat History</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b-2 border-border shrink-0">
          <Button
            onClick={handleNewChat}
            className="w-full gap-2 border-2 border-primary h-10"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No conversations yet
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group flex items-center gap-2 p-3 cursor-pointer border-2 transition-all active:scale-98',
                    currentChatId === chat.id
                      ? 'bg-primary/10 border-primary'
                      : 'border-transparent hover:border-muted active:bg-muted/50'
                  )}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {chat.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatTime(chat.updatedAt)} · {chat.messages.length} messages
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
