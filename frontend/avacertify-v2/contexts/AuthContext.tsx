"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '@/utils/api'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'USER' | 'ADMIN'
  emailVerified: boolean
  profileCompleted: boolean
  institutionId?: string
  institution?: {
    id: string
    slug: string
    name: string
  }
  createdAt: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    institutionId?: string
  }) => Promise<void>
  logout: () => void
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    institutionId?: string
  }) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await authAPI.me()
      setUser(response.data.user)
    } catch (error) {
      // Token is invalid, remove it
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      const { user, accessToken, refreshToken } = response.data

      // Store tokens immediately
      Cookies.set('accessToken', accessToken, { expires: 7 })
      Cookies.set('refreshToken', refreshToken, { expires: 30 })

      // Set user state immediately
      setUser(user)

      // Immediate redirect based on role (no toast delay)
      if (user.role === 'ADMIN') {
        router.replace('/admin') // Use replace for faster navigation
      } else {
        router.replace('/profile') // Use replace for faster navigation
      }

      // Show success toast after redirect
      setTimeout(() => {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        })
      }, 100)
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      })
      throw error
    }
  }

  const signup = async (data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    institutionId?: string
  }) => {
    try {
      const response = await authAPI.signup(data)
      const { user, accessToken, refreshToken } = response.data

      // Store tokens immediately
      Cookies.set('accessToken', accessToken, { expires: 7 })
      Cookies.set('refreshToken', refreshToken, { expires: 30 })

      // Set user state immediately
      setUser(user)

      // Immediate redirect to profile
      router.replace('/profile')

      // Show success toast after redirect
      setTimeout(() => {
        toast({
          title: 'Account Created',
          description: 'Welcome to Dada Devs!',
        })
      }, 100)
    } catch (error: any) {
      const message = error.response?.data?.error || 'Signup failed'
      toast({
        title: 'Signup Failed',
        description: message,
        variant: 'destructive',
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear tokens and user state
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      setUser(null)
      
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
      })

      router.push('/')
    }
  }

  const updateProfile = async (data: {
    firstName?: string
    lastName?: string
    institutionId?: string
  }) => {
    try {
      const response = await authAPI.updateProfile(data)
      setUser(response.data.user)

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error: any) {
      const message = error.response?.data?.error || 'Update failed'
      toast({
        title: 'Update Failed',
        description: message,
        variant: 'destructive',
      })
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const response = await authAPI.me()
      setUser(response.data.user)
    } catch (error) {
      // Handle error silently
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}