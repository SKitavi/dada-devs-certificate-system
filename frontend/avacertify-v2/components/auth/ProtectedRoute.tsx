"use client"

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'USER' | 'ADMIN'
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    if (requireRole && user?.role !== requireRole) {
      // Redirect based on user role
      if (user?.role === 'ADMIN') {
        router.push('/admin')
      } else if (user?.role === 'USER') {
        router.push('/profile')
      } else {
        router.push('/')
      }
      return
    }
  }, [user, loading, requireAuth, requireRole, redirectTo, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (requireRole && user?.role !== requireRole) {
    return null
  }

  return <>{children}</>
}