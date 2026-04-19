'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { 
  Brain, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2
} from 'lucide-react'

export function PersonaSelector() {
  const [collapsed, setCollapsed] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newPersona, setNewPersona] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    active: false
  })
  
  const { personas, activePersona, setActivePersona, addPersona, deletePersona, isAdmin } = useAppStore()

  const handleAddPersona = () => {
    if (newPersona.name && newPersona.systemPrompt) {
      addPersona(newPersona)
      setNewPersona({ name: '', description: '', systemPrompt: '', active: false })
      setDialogOpen(false)
    }
  }

  if (collapsed) {
    return (
      <div className="w-12 border-l-4 border-border bg-card flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Brain className="h-5 w-5 text-primary" />
      </div>
    )
  }

  return (
    <div className="w-64 border-l-4 border-border bg-card flex flex-col">
      <div className="p-4 border-b-2 border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">Personas</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className={cn(
                'group p-3 border-2 cursor-pointer transition-all relative',
                activePersona === persona.id
                  ? 'border-secondary bg-secondary/10'
                  : 'border-transparent hover:border-muted'
              )}
              onClick={() => setActivePersona(persona.id)}
            >
              <div className="flex items-start gap-2">
                <Sparkles className={cn(
                  'h-4 w-4 mt-0.5',
                  activePersona === persona.id ? 'text-secondary' : 'text-muted-foreground'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{persona.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {persona.description}
                  </div>
                </div>
                {isAdmin && persona.id !== 'default' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePersona(persona.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {isAdmin && (
        <div className="p-4 border-t-2 border-border">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2 border-2">
                <Plus className="h-4 w-4" />
                Add Persona
              </Button>
            </DialogTrigger>
            <DialogContent className="border-4 border-primary bg-card">
              <DialogHeader>
                <DialogTitle>Create New Persona</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Persona name"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                  className="border-2"
                />
                <Input
                  placeholder="Short description"
                  value={newPersona.description}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, description: e.target.value }))}
                  className="border-2"
                />
                <Textarea
                  placeholder="System prompt (instructions for the AI)"
                  value={newPersona.systemPrompt}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  className="border-2 min-h-[120px]"
                />
                <Button 
                  onClick={handleAddPersona} 
                  className="w-full border-2 border-primary"
                  disabled={!newPersona.name || !newPersona.systemPrompt}
                >
                  Create Persona
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
