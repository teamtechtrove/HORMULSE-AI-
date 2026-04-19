'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings,
  Lock,
  Menu,
  X,
  Zap
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { AdminLoginDialog } from './admin-login-dialog'

const navItems = [
  { href: '/', label: 'Chat', icon: MessageSquare },
  { href: '/discussion', label: 'Discussion', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const { isAdmin, adminLogout } = useAppStore()

  return (
    <>
      <header className="sticky top-0 z-50 border-b-4 border-primary bg-background">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary neon-pulse" />
              <div className="absolute inset-0 blur-sm bg-primary/30 rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tighter glitch-text hidden sm:block">
              HORMULSE AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'gap-2 border-2 border-transparent',
                      isActive && 'border-primary shadow-md'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <Link href="/admin">
                  <Button variant="outline" className="gap-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={adminLogout}
                  className="text-destructive"
                >
                  <Lock className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAdminDialogOpen(true)}
                className="opacity-30 hover:opacity-100 transition-opacity"
              >
                <Lock className="h-4 w-4" />
              </Button>
            )}
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t-2 border-border p-4 bg-card">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-2 border-2',
                        isActive ? 'border-primary' : 'border-transparent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Creator Credit */}
      <a
        href="https://portfolioofarman.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 z-50 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Created by Arman Rafi
      </a>

      <AdminLoginDialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen} />
    </>
  )
}
