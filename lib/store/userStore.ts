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
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nickname: string) => Promise<void>
  logout: () => Promise<void>  // 🔥 明确返回 Promise
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

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '登录失败')
    }
    // 🔥 login 内部调用 fetchUser，外部不需要再调用
    await get().fetchUser()
  },

  register: async (email, password, nickname) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '注册失败')
    }
    await get().fetchUser()
  },

  logout: async () => {  // 🔥 async 函数
    await fetch('/api/auth/logout', { method: 'POST' })
    set({ user: null })
  },
}))