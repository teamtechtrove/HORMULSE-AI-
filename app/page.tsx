'use client'

import { useState } from 'react'
import { MobileHeader } from '@/components/mobile-header'
import { MobileChatInterface } from '@/components/mobile-chat-interface'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { MobilePersonaSheet } from '@/components/mobile-persona-sheet'

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [personaOpen, setPersonaOpen] = useState(false)

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)}
        onPersonaClick={() => setPersonaOpen(true)}
      />
      <MobileChatInterface />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobilePersonaSheet open={personaOpen} onClose={() => setPersonaOpen(false)} />
    </div>
  )
}
