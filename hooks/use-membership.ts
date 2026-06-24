'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/lib/store/userStore';

interface Membership {
  isPro: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  endDate: string | null;
  remainingDays: number;
}

export function useMembership() {
  const { user } = useUserStore();
  // 通过 user 是否存在来判断是否已登录
  const isLoggedIn = !!user;
  
  const [membership, setMembership] = useState<Membership>({
    isPro: false,
    plan: 'free',
    endDate: null,
    remainingDays: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMembership = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setMembership({ isPro: false, plan: 'free', endDate: null, remainingDays: 0 });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/payment/status');
      const data = await res.json();
      setMembership(data);
    } catch (error) {
      console.error('Failed to fetch membership:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return { membership, loading, refresh: fetchMembership };
}