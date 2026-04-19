'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { Lock, AlertCircle } from 'lucide-react'

interface AdminLoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLoginDialog({ open, onOpenChange }: AdminLoginDialogProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const { adminLogin } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (attempts >= 5) {
      setError(true)
      return
    }

    const success = adminLogin(password)
    if (success) {
      setPassword('')
      setError(false)
      setAttempts(0)
      onOpenChange(false)
    } else {
      setError(true)
      setAttempts(prev => prev + 1)
      setPassword('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 border-primary bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-primary" />
            Admin Authentication
          </DialogTitle>
          <DialogDescription>
            Enter the admin password to access the control panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              disabled={attempts >= 5}
              className="border-2 border-border bg-muted focus:border-primary"
            />
            
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {attempts >= 5 
                  ? 'Too many failed attempts. Please try again later.'
                  : `Invalid password. ${5 - attempts} attempts remaining.`
                }
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!password || attempts >= 5}
              className="flex-1 border-2 border-primary"
            >
              Authenticate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
