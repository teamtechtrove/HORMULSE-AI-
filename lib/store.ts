import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface Persona {
  id: string
  name: string
  description: string
  systemPrompt: string
  active: boolean
}

export interface DiscussionPost {
  id: string
  title: string
  content: string
  author: string
  upvotes: number
  downvotes: number
  replies: DiscussionReply[]
  createdAt: number
  pinned: boolean
}

export interface DiscussionReply {
  id: string
  content: string
  author: string
  upvotes: number
  downvotes: number
  createdAt: number
  isAI?: boolean
}

export interface AnalyticsEvent {
  id: string
  type: string
  data: Record<string, unknown>
  timestamp: number
}

export interface AIProvider {
  id: string
  name: string
  enabled: boolean
  apiKey: string
  model: string
  baseUrl?: string
}

export interface APISettings {
  defaultProvider: string
  maxTokens: number
  temperature: number
  streamingEnabled: boolean
}

interface AppState {
  // Chat
  chats: Chat[]
  currentChatId: string | null
  addChat: () => string
  deleteChat: (id: string) => void
  setCurrentChat: (id: string) => void
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateChatTitle: (chatId: string, title: string) => void
  
  // Personas
  personas: Persona[]
  activePersona: string | null
  addPersona: (persona: Omit<Persona, 'id'>) => void
  updatePersona: (id: string, persona: Partial<Persona>) => void
  deletePersona: (id: string) => void
  setActivePersona: (id: string | null) => void
  
  // Discussion
  posts: DiscussionPost[]
  addPost: (post: Omit<DiscussionPost, 'id' | 'createdAt' | 'replies' | 'upvotes' | 'downvotes' | 'pinned'>) => void
  addReply: (postId: string, reply: Omit<DiscussionReply, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>) => void
  votePost: (postId: string, type: 'up' | 'down') => void
  voteReply: (postId: string, replyId: string, type: 'up' | 'down') => void
  pinPost: (postId: string) => void
  deletePost: (postId: string) => void
  
  // Analytics
  events: AnalyticsEvent[]
  trackEvent: (type: string, data: Record<string, unknown>) => void
  
  // AI Providers
  providers: AIProvider[]
  updateProvider: (id: string, data: Partial<AIProvider>) => void
  addProvider: (provider: Omit<AIProvider, 'id'>) => void
  deleteProvider: (id: string) => void
  
  // API Settings
  apiSettings: APISettings
  updateAPISettings: (settings: Partial<APISettings>) => void
  
  // Admin
  isAdmin: boolean
  adminLogin: (password: string) => boolean
  adminLogout: () => void
  
  // Settings
  ghostMode: boolean
  setGhostMode: (enabled: boolean) => void
}

const defaultPersonas: Persona[] = [
  {
    id: 'default',
    name: 'HORMULSE',
    description: 'The primary AI assistant',
    systemPrompt: 'You are HORMULSE AI, an advanced self-evolving artificial intelligence system. You are knowledgeable, precise, and helpful. You provide comprehensive answers while maintaining a slightly futuristic and technological tone.',
    active: true
  },
  {
    id: 'socratic',
    name: 'Socratic Skeptic',
    description: 'Questions everything to find truth',
    systemPrompt: 'You are a Socratic philosopher who questions everything. Instead of giving direct answers, you guide users to discover truth through questioning. Always respond with thought-provoking questions that challenge assumptions.',
    active: false
  },
  {
    id: 'creative',
    name: 'Creative Poet',
    description: 'Artistic and expressive responses',
    systemPrompt: 'You are a creative poet and artist. You express ideas through beautiful language, metaphors, and artistic expressions. Your responses are imaginative and evocative.',
    active: false
  },
  {
    id: 'logician',
    name: 'Cold Logician',
    description: 'Pure logic and reasoning',
    systemPrompt: 'You are a pure logician. You analyze everything through strict logical reasoning. You break down problems into premises and conclusions, identify fallacies, and provide structured, analytical responses.',
    active: false
  }
]

const defaultProviders: AIProvider[] = [
  { id: 'openai', name: 'OpenAI GPT-4', enabled: true, model: 'openai/gpt-4o', apiKey: '' },
  { id: 'anthropic', name: 'Claude', enabled: true, model: 'anthropic/claude-sonnet-4-20250514', apiKey: '' },
  { id: 'google', name: 'Gemini', enabled: true, model: 'google/gemini-2.0-flash', apiKey: '' },
  { id: 'deepseek', name: 'DeepSeek', enabled: false, model: 'deepseek/deepseek-chat', apiKey: '' },
  { id: 'groq', name: 'Groq', enabled: false, model: 'groq/llama-3.3-70b-versatile', apiKey: '' },
  { id: 'xai', name: 'xAI Grok', enabled: false, model: 'xai/grok-beta', apiKey: '' },
  { id: 'mistral', name: 'Mistral', enabled: false, model: 'mistral/mistral-large-latest', apiKey: '' },
  { id: 'cohere', name: 'Cohere', enabled: false, model: 'cohere/command-r-plus', apiKey: '' },
]

const defaultAPISettings: APISettings = {
  defaultProvider: 'openai',
  maxTokens: 4096,
  temperature: 0.7,
  streamingEnabled: true
}

const ADMIN_PASSWORD = 'Admin@2025'

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Chat state
      chats: [],
      currentChatId: null,
      
      addChat: () => {
        const id = crypto.randomUUID()
        const newChat: Chat = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        set(state => ({
          chats: [newChat, ...state.chats],
          currentChatId: id
        }))
        get().trackEvent('chat_created', { chatId: id })
        return id
      },
      
      deleteChat: (id) => {
        set(state => ({
          chats: state.chats.filter(c => c.id !== id),
          currentChatId: state.currentChatId === id ? null : state.currentChatId
        }))
        get().trackEvent('chat_deleted', { chatId: id })
      },
      
      setCurrentChat: (id) => {
        set({ currentChatId: id })
      },
      
      addMessage: (chatId, message) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        }
        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  updatedAt: Date.now(),
                  title: chat.messages.length === 0 && message.role === 'user' 
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : chat.title
                }
              : chat
          )
        }))
        get().trackEvent('message_sent', { chatId, role: message.role })
      },
      
      updateChatTitle: (chatId, title) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, title } : chat
          )
        }))
      },
      
      // Personas
      personas: defaultPersonas,
      activePersona: 'default',
      
      addPersona: (persona) => {
        const newPersona = { ...persona, id: crypto.randomUUID() }
        set(state => ({ personas: [...state.personas, newPersona] }))
        get().trackEvent('persona_created', { personaId: newPersona.id })
      },
      
      updatePersona: (id, persona) => {
        set(state => ({
          personas: state.personas.map(p => p.id === id ? { ...p, ...persona } : p)
        }))
      },
      
      deletePersona: (id) => {
        set(state => ({
          personas: state.personas.filter(p => p.id !== id),
          activePersona: state.activePersona === id ? 'default' : state.activePersona
        }))
      },
      
      setActivePersona: (id) => {
        set({ activePersona: id })
      },
      
      // Discussion
      posts: [],
      
      addPost: (post) => {
        const newPost: DiscussionPost = {
          ...post,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          replies: [],
          upvotes: 0,
          downvotes: 0,
          pinned: false
        }
        set(state => ({ posts: [newPost, ...state.posts] }))
        get().trackEvent('post_created', { postId: newPost.id })
      },
      
      addReply: (postId, reply) => {
        const newReply: DiscussionReply = {
          ...reply,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          upvotes: 0,
          downvotes: 0
        }
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, replies: [...post.replies, newReply] }
              : post
          )
        }))
        get().trackEvent('reply_created', { postId, replyId: newReply.id })
      },
      
      votePost: (postId, type) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, [type === 'up' ? 'upvotes' : 'downvotes']: post[type === 'up' ? 'upvotes' : 'downvotes'] + 1 }
              : post
          )
        }))
        get().trackEvent('post_vote', { postId, type })
      },
      
      voteReply: (postId, replyId, type) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  replies: post.replies.map(reply =>
                    reply.id === replyId
                      ? { ...reply, [type === 'up' ? 'upvotes' : 'downvotes']: reply[type === 'up' ? 'upvotes' : 'downvotes'] + 1 }
                      : reply
                  )
                }
              : post
          )
        }))
      },
      
      pinPost: (postId) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId ? { ...post, pinned: !post.pinned } : post
          )
        }))
      },
      
      deletePost: (postId) => {
        set(state => ({
          posts: state.posts.filter(p => p.id !== postId)
        }))
      },
      
      // Analytics
      events: [],
      
      trackEvent: (type, data) => {
        const event: AnalyticsEvent = {
          id: crypto.randomUUID(),
          type,
          data,
          timestamp: Date.now()
        }
        set(state => ({
          events: [...state.events.slice(-999), event]
        }))
      },
      
      // Providers
      providers: defaultProviders,
      
      updateProvider: (id, data) => {
        set(state => ({
          providers: state.providers.map(p => p.id === id ? { ...p, ...data } : p)
        }))
        get().trackEvent('provider_updated', { providerId: id })
      },
      
      addProvider: (provider) => {
        const newProvider = { ...provider, id: crypto.randomUUID() }
        set(state => ({ providers: [...state.providers, newProvider] }))
        get().trackEvent('provider_added', { providerId: newProvider.id })
      },
      
      deleteProvider: (id) => {
        set(state => ({
          providers: state.providers.filter(p => p.id !== id)
        }))
        get().trackEvent('provider_deleted', { providerId: id })
      },
      
      // API Settings
      apiSettings: defaultAPISettings,
      
      updateAPISettings: (settings) => {
        set(state => ({
          apiSettings: { ...state.apiSettings, ...settings }
        }))
        get().trackEvent('api_settings_updated', settings)
      },
      
      // Admin
      isAdmin: false,
      
      adminLogin: (password) => {
        const success = password === ADMIN_PASSWORD
        if (success) {
          set({ isAdmin: true })
          get().trackEvent('admin_login', { success: true })
        } else {
          get().trackEvent('admin_login', { success: false })
        }
        return success
      },
      
      adminLogout: () => {
        set({ isAdmin: false })
        get().trackEvent('admin_logout', {})
      },
      
      // Settings
      ghostMode: false,
      
      setGhostMode: (enabled) => {
        set({ ghostMode: enabled })
      }
    }),
    {
      name: 'hormulse-storage',
      partialize: (state) => ({
        chats: state.chats,
        personas: state.personas,
        activePersona: state.activePersona,
        posts: state.posts,
        providers: state.providers,
        apiSettings: state.apiSettings,
        ghostMode: state.ghostMode
      })
    }
  )
)
