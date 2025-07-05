'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  className?: string
  children: ReactNode
}

export function Tabs({ 
  value: controlledValue, 
  onValueChange, 
  defaultValue = '', 
  className,
  children 
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  const handleValueChange = onValueChange || setUncontrolledValue

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div 
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: ReactNode
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component')
  }

  const { value: selectedValue, onValueChange } = context
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected 
          ? 'bg-white text-gray-950 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        className
      )}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: ReactNode
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component')
  }

  const { value: selectedValue } = context
  const isSelected = selectedValue === value

  if (!isSelected) return null

  return (
    <div 
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
        className
      )}
      role="tabpanel"
    >
      {children}
    </div>
  )
} 