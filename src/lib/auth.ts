import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'frontdesk' | 'user'
  phone: string | null
  created_at: string
  updated_at: string
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export function hasRole(profile: Profile | null, requiredRoles: string[]): boolean {
  if (!profile) return false
  return requiredRoles.includes(profile.role)
}

export function isAdmin(profile: Profile | null): boolean {
  return hasRole(profile, ['admin'])
}

export function isFrontDesk(profile: Profile | null): boolean {
  return hasRole(profile, ['admin', 'frontdesk'])
}
