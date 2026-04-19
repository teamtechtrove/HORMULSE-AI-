'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Trash2,
  Send,
  Clock,
  User,
  Bot,
  TrendingUp,
  ArrowLeft,
  X
} from 'lucide-react'

export default function DiscussionPage() {
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [newPost, setNewPost] = useState({ title: '', content: '', author: '' })
  const [replyContent, setReplyContent] = useState('')
  const [replyAuthor, setReplyAuthor] = useState('')

  const { 
    posts, 
    addPost, 
    addReply, 
    votePost, 
    voteReply, 
    pinPost, 
    deletePost,
    isAdmin 
  } = useAppStore()

  const handleCreatePost = () => {
    if (newPost.title && newPost.content && newPost.author) {
      addPost(newPost)
      setNewPost({ title: '', content: '', author: '' })
      setShowNewPost(false)
    }
  }

  const handleAddReply = (postId: string) => {
    if (replyContent && replyAuthor) {
      addReply(postId, { content: replyContent, author: replyAuthor })
      setReplyContent('')
      setReplyAuthor('')
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const getViralityScore = (post: typeof posts[0]) => {
    const ageHours = (Date.now() - post.createdAt) / 3600000
    const score = (post.upvotes - post.downvotes + post.replies.length * 2) / Math.pow(ageHours + 1, 0.5)
    return Math.round(score * 10)
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.createdAt - a.createdAt
  })

  const currentPost = selectedPost ? posts.find(p => p.id === selectedPost) : null

  // New Post Form View
  if (showNewPost) {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="shrink-0 h-14 border-b-4 border-primary flex items-center px-3 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowNewPost(false)}>
            <X className="h-5 w-5" />
          </Button>
          <span className="font-bold">New Post</span>
        </header>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <Input
            placeholder="Your name"
            value={newPost.author}
            onChange={(e) => setNewPost(prev => ({ ...prev, author: e.target.value }))}
            className="border-2 h-11"
          />
          <Input
            placeholder="Post title"
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            className="border-2 h-11"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            className="border-2 min-h-[150px]"
          />
        </div>
        <div className="shrink-0 p-4 border-t-2 border-border safe-area-bottom">
          <Button 
            onClick={handleCreatePost} 
            className="w-full h-11 border-2 border-primary"
            disabled={!newPost.title || !newPost.content || !newPost.author}
          >
            Publish Post
          </Button>
        </div>
      </div>
    )
  }

  // Post Detail View
  if (currentPost) {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="shrink-0 h-14 border-b-4 border-primary flex items-center px-3 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold truncate flex-1">{currentPost.title}</span>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Post Content */}
          <div className="p-4 border-b-2 border-border">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentPost.author}</span>
              <span className="text-xs text-muted-foreground">· {formatTime(currentPost.createdAt)}</span>
              {currentPost.pinned && (
                <Badge variant="outline" className="border-secondary text-secondary text-[10px]">
                  <Pin className="h-2.5 w-2.5 mr-0.5" />
                  Pinned
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed">{currentPost.content}</p>
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => votePost(currentPost.id, 'up')}
                className="h-8 gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                {currentPost.upvotes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => votePost(currentPost.id, 'down')}
                className="h-8 gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                {currentPost.downvotes}
              </Button>
              {isAdmin && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => pinPost(currentPost.id)} className="h-8">
                    <Pin className={cn('h-4 w-4', currentPost.pinned && 'text-secondary')} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { deletePost(currentPost.id); setSelectedPost(null) }} className="h-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Replies */}
          <div className="p-4">
            <h4 className="font-semibold text-sm mb-3">Replies ({currentPost.replies.length})</h4>
            {currentPost.replies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No replies yet</p>
            ) : (
              <div className="space-y-3">
                {currentPost.replies.map(reply => (
                  <div key={reply.id} className="p-3 border-2 border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        {reply.isAI ? (
                          <Bot className="h-3.5 w-3.5 text-secondary" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                        <span className="font-medium">{reply.author}</span>
                        {reply.isAI && (
                          <Badge variant="outline" className="text-[10px] h-4 border-secondary text-secondary">AI</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => voteReply(currentPost.id, reply.id, 'up')} className="h-6 px-2 gap-1 text-xs">
                        <ThumbsUp className="h-3 w-3" /> {reply.upvotes}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => voteReply(currentPost.id, reply.id, 'down')} className="h-6 px-2 gap-1 text-xs">
                        <ThumbsDown className="h-3 w-3" /> {reply.downvotes}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Input */}
        <div className="shrink-0 p-3 border-t-2 border-border bg-card safe-area-bottom space-y-2">
          <Input placeholder="Your name" value={replyAuthor} onChange={(e) => setReplyAuthor(e.target.value)} className="border-2 h-9 text-sm" />
          <div className="flex gap-2">
            <Input placeholder="Write a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="flex-1 border-2 h-10 text-sm" />
            <Button onClick={() => handleAddReply(currentPost.id)} disabled={!replyContent || !replyAuthor} className="h-10 w-10 border-2 border-primary" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Posts List View
  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <header className="shrink-0 h-14 border-b-4 border-primary flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-bold">Discussion</span>
        </div>
        <Button size="sm" onClick={() => setShowNewPost(true)} className="h-8 gap-1 border-2 border-primary">
          <Plus className="h-4 w-4" />
          Post
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold mb-1">No posts yet</h3>
            <p className="text-xs text-muted-foreground mb-4">Be the first to start a discussion!</p>
            <Button onClick={() => setShowNewPost(true)} size="sm" className="gap-1 border-2 border-primary">
              <Plus className="h-4 w-4" /> Create Post
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPosts.map(post => (
              <Card 
                key={post.id} 
                className={cn('border-2 transition-all active:scale-98', post.pinned ? 'border-secondary' : 'border-border')}
                onClick={() => setSelectedPost(post.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {post.pinned && (
                          <Badge variant="outline" className="border-secondary text-secondary text-[10px] h-4">
                            <Pin className="h-2.5 w-2.5 mr-0.5" /> Pinned
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-muted text-[10px] h-4">
                          <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> {getViralityScore(post)}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm truncate">{post.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(post.createdAt)}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.replies.length}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.upvotes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
