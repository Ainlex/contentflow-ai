'use client'

import { useAuthRedirect } from '@/lib/hooks/use-auth-redirect'

export function AuthRedirectProvider({ children }: { children: React.ReactNode }) {
  useAuthRedirect()
  
  return <>{children}</>
} 