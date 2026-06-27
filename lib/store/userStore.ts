// lib/store/userStore.ts
import { create } from 'zustand'

interface User {
  id: string
  email: string
  nickname: string
  isPro: boolean
  usageToday: number
  remainingToday: number
  plan: string
}

interface UserState {
  user: User | null
  loading: boolean
  fetchUser: () => Promise<void>
  login: (email: string, password: string, turnstileToken: string) => Promise<void>  // ✅ 添加 turnstileToken
  register: (email: string, password: string, nickname: string, turnstileToken: string) => Promise<void>  // ✅ 添加 turnstileToken
  logout: () => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      set({ user: data.user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  // ✅ 修改 login：添加 turnstileToken 参数
  login: async (email, password, turnstileToken) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, turnstileToken }),  // ✅ 传递 token
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '登录失败')
    }
    await get().fetchUser()
  },

  // ✅ 修改 register：添加 turnstileToken 参数
  register: async (email, password, nickname, turnstileToken) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname, turnstileToken }),  // ✅ 传递 token
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '注册失败')
    }
    await get().fetchUser()
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    set({ user: null })
  },
}))