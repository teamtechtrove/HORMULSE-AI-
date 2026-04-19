'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { 
  Brain, 
  Plus, 
  Sparkles,
  Trash2,
  X,
  Check
} from 'lucide-react'

interface MobilePersonaSheetProps {
  open: boolean
  onClose: () => void
}

export function MobilePersonaSheet({ open, onClose }: MobilePersonaSheetProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newPersona, setNewPersona] = useState({
    name: '',
    description: '',
    systemPrompt: ''
  })
  
  const { personas, activePersona, setActivePersona, addPersona, deletePersona, isAdmin } = useAppStore()

  const handleSelectPersona = (personaId: string) => {
    setActivePersona(personaId)
    onClose()
  }

  const handleAddPersona = () => {
    if (newPersona.name && newPersona.systemPrompt) {
      addPersona({ ...newPersona, active: false })
      setNewPersona({ name: '', description: '', systemPrompt: '' })
      setIsAdding(false)
    }
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

      {/* Bottom Sheet */}
      <div 
        className={cn(
          'fixed inset-x-0 bottom-0 bg-card border-t-4 border-primary z-50 flex flex-col transition-transform duration-300 ease-out max-h-[80vh] rounded-t-xl',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b-2 border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Select Persona</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {isAdding ? (
            <div className="space-y-3">
              <Input
                placeholder="Persona name"
                value={newPersona.name}
                onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                className="border-2 h-10 text-sm"
              />
              <Input
                placeholder="Short description"
                value={newPersona.description}
                onChange={(e) => setNewPersona(prev => ({ ...prev, description: e.target.value }))}
                className="border-2 h-10 text-sm"
              />
              <Textarea
                placeholder="System prompt (AI instructions)"
                value={newPersona.systemPrompt}
                onChange={(e) => setNewPersona(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="border-2 min-h-[100px] text-sm"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-2"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPersona} 
                  className="flex-1 border-2 border-primary"
                  disabled={!newPersona.name || !newPersona.systemPrompt}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className={cn(
                    'group p-3 border-2 cursor-pointer transition-all active:scale-98 flex items-start gap-3',
                    activePersona === persona.id
                      ? 'border-secondary bg-secondary/10'
                      : 'border-transparent hover:border-muted active:bg-muted/50'
                  )}
                  onClick={() => handleSelectPersona(persona.id)}
                >
                  <Sparkles className={cn(
                    'h-4 w-4 mt-0.5 shrink-0',
                    activePersona === persona.id ? 'text-secondary' : 'text-muted-foreground'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{persona.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {persona.description}
                    </div>
                  </div>
                  {activePersona === persona.id && (
                    <Check className="h-4 w-4 text-secondary shrink-0" />
                  )}
                  {isAdmin && persona.id !== 'default' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePersona(persona.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAdmin && !isAdding && (
          <div className="p-3 border-t-2 border-border shrink-0 safe-area-bottom">
            <Button 
              variant="outline" 
              className="w-full gap-2 border-2 h-10"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4" />
              Add Custom Persona
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
