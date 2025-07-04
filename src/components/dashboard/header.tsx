'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  User, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronDown
} from 'lucide-react'

interface HeaderProps {
  pageTitle: string
  onMobileMenuToggle: () => void
  className?: string
}

interface UserProfile {
  id: string
  email: string
  company_name: string | null
}

export function Header({ pageTitle, onMobileMenuToggle, className }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Obtener perfil del usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, company_name')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('Error fetching profile:', profileError)
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.log('Error getting user:', err)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getUserInitials = (email: string, companyName?: string | null) => {
    if (companyName) {
      return companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const getUserDisplayName = (email: string, companyName?: string | null) => {
    return companyName || email.split('@')[0]
  }

  return (
    <header className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button + Page title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="md:hidden h-8 w-8 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 h-8 px-2 hover:bg-gray-50"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {profile && getUserInitials(profile.email, profile.company_name)}
                  </span>
                </div>
                
                {/* User name - hidden on mobile */}
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {profile && getUserDisplayName(profile.email, profile.company_name)}
                </span>
                
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {profile && getUserDisplayName(profile.email, profile.company_name)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile?.email}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      router.push('/dashboard/settings')
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      router.push('/dashboard/billing')
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      // TODO: Implement support page
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Support
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 