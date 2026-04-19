'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  Brain, 
  Zap,
  MoreVertical,
  Users,
  BarChart3,
  Settings,
  Lock
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminLoginDialog } from './admin-login-dialog'
import { useState } from 'react'

interface MobileHeaderProps {
  onMenuClick: () => void
  onPersonaClick: () => void
}

export function MobileHeader({ onMenuClick, onPersonaClick }: MobileHeaderProps) {
  const { isAdmin, adminLogout, personas, activePersona } = useAppStore()
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const currentPersona = personas.find(p => p.id === activePersona)

  return (
    <>
      <header className="shrink-0 h-14 border-b-4 border-primary bg-background flex items-center justify-between px-3 gap-2">
        {/* Left - Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center - Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="relative">
            <Zap className="h-6 w-6 text-primary neon-pulse" />
          </div>
          <span className="text-base font-bold tracking-tighter glitch-text">
            HORMULSE AI
          </span>
        </Link>

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPersonaClick}
            className="shrink-0 relative"
          >
            <Brain className="h-5 w-5" />
            {currentPersona && currentPersona.id !== 'default' && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-2 border-border">
              <DropdownMenuItem asChild>
                <Link href="/discussion" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Discussion
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAdmin ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={adminLogout} className="text-destructive">
                    <Lock className="h-4 w-4 mr-2" />
                    Logout Admin
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => setAdminDialogOpen(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Admin Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Creator Credit */}
      <a
        href="https://portfolioofarman.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 left-3 z-40 text-[10px] text-muted-foreground/50 hover:text-primary transition-colors"
      >
        by Arman Rafi
      </a>

      <AdminLoginDialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen} />
    </>
  )
}
