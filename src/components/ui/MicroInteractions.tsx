'use client'

import { ReactNode } from 'react'

interface MicroInteractionProps {
  children: ReactNode
  type?: 'hover-lift' | 'hover-scale' | 'hover-glow' | 'bounce' | 'pulse' | 'wiggle'
  intensity?: 'subtle' | 'medium' | 'strong'
  className?: string
}

export function MicroInteraction({ 
  children, 
  type = 'hover-lift', 
  intensity = 'medium',
  className = '' 
}: MicroInteractionProps) {
  const baseClasses = "transition-all duration-300 ease-out"
  
  const interactionClasses = {
    'hover-lift': {
      subtle: 'hover:-translate-y-1 hover:shadow-md',
      medium: 'hover:-translate-y-2 hover:shadow-lg',
      strong: 'hover:-translate-y-3 hover:shadow-xl'
    },
    'hover-scale': {
      subtle: 'hover:scale-105',
      medium: 'hover:scale-110',
      strong: 'hover:scale-115'
    },
    'hover-glow': {
      subtle: 'hover:shadow-indigo-500/25 hover:shadow-lg',
      medium: 'hover:shadow-indigo-500/50 hover:shadow-xl',
      strong: 'hover:shadow-indigo-500/75 hover:shadow-2xl'
    },
    'bounce': 'animate-bounce',
    'pulse': 'animate-pulse',
    'wiggle': 'hover:animate-pulse'
  }
  
  const selectedClasses = type === 'bounce' || type === 'pulse' || type === 'wiggle'
    ? interactionClasses[type]
    : interactionClasses[type][intensity]
  
  return (
    <div className={`${baseClasses} ${selectedClasses} ${className}`}>
      {children}
    </div>
  )
}

// Specialized micro-interaction components
export function HoverCard({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <MicroInteraction 
      type="hover-lift" 
      intensity="medium" 
      className={`cursor-pointer ${className}`}
    >
      {children}
    </MicroInteraction>
  )
}

export function ClickableButton({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <MicroInteraction 
      type="hover-scale" 
      intensity="subtle" 
      className={`active:scale-95 ${className}`}
    >
      {children}
    </MicroInteraction>
  )
}

export function GlowCard({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <MicroInteraction 
      type="hover-glow" 
      intensity="medium" 
      className={`${className}`}
    >
      {children}
    </MicroInteraction>
  )
}


