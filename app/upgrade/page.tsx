'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Check,
  Crown,
  Loader2,
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
} from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { useMembership } from '@/hooks/use-membership';
import { cn } from '@/lib/utils';

const PRICES = {
  monthly: 'NT$65',
  yearly: 'NT$650',
};

// 🔥 Lemon Squeezy 产品 UUID
const LEMON_UUIDS = {
  monthly: process.env.NEXT_PUBLIC_LEMON_MONTHLY_UUID || 'a14823c9-4d13-4fa3-927f-48d56531b13a',
  yearly: process.env.NEXT_PUBLIC_LEMON_YEARLY_UUID || '4cfddc18-1145-4b61-a6f6-1cfd62c2c7e6',
};

const LEMON_STORE = 'openmaic';

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { membership, loading, refresh } = useMembership();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && membership.isPro) {
      router.push('/');
    }
  }, [loading, membership.isPro, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // 🔥 Lemon Squeezy 直接跳转
  const handleLemonPayment = (plan: 'monthly' | 'yearly') => {
    const uuid = LEMON_UUIDS[plan];
    const url = `https://${LEMON_STORE}.lemonsqueezy.com/checkout/buy/${uuid}`;
    window.location.href = url;
  };

  if (loading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (membership.isPro) {
    return null;
  }

  const plans = {
    monthly: {
      name: '月度会员',
      price: PRICES.monthly,
      period: '/月',
      priceUsd: '$2/月',
      features: [
        '无限次 AI 课堂生成',
        '所有学科全解锁',
        '对话历史永久保存',
        '优先使用最新 AI 模型',
        '智能体深度交互',
      ],
      popular: false,
      badge: null,
    },
    yearly: {
      name: '年度会员',
      price: PRICES.yearly,
      period: '/年',
      priceUsd: '$20/年',
      features: [
        '无限次 AI 课堂生成',
        '所有学科全解锁',
        '对话历史永久保存',
        '优先使用最新 AI 模型',
        '智能体深度交互',
        '🎁 额外赠送 2 个月',
      ],
      popular: true,
      badge: '省 1 个月',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:border-gray-800/50 dark:bg-gray-900/80">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="size-4" />
            返回首页
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
            <Crown className="size-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            升级到 <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Pro</span>
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            解锁全部功能，让 AI 课堂体验更强大
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex justify-center"
        >
          <div className="flex rounded-2xl bg-gray-100/70 p-1 dark:bg-gray-800/70">
            {(['monthly', 'yearly'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all',
                  selectedPlan === plan
                    ? 'bg-white text-gray-900 shadow-md dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {plans[plan].name}
                {plans[plan].badge && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {plans[plan].badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          key={selectedPlan}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          <div className="overflow-hidden rounded-3xl border-2 border-blue-100 bg-white shadow-xl dark:border-blue-900/30 dark:bg-gray-900">
            <div className="p-8">
              <div className="text-center">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {plans[selectedPlan].price}
                </span>
                <span className="text-lg text-gray-500 dark:text-gray-400">
                  {plans[selectedPlan].period}
                </span>
                <p className="mt-1 text-sm text-gray-400">
                  ≈ {plans[selectedPlan].priceUsd}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {plans[selectedPlan].features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="size-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* 🔥 Lemon Squeezy 支付按钮 */}
              <div className="mt-8">
                <button
                  onClick={() => handleLemonPayment(selectedPlan)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3.5 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                  🔒 立即支付
                </button>
                <p className="mt-3 text-center text-xs text-gray-400">
                  🔒 安全支付 · 支持信用卡 / PayPal · 由 Lemon Squeezy 提供
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>按月订阅，可随时取消 · 已订阅用户登录后自动生效</p>
          <p className="mt-1">💳 支持台湾地区信用卡和 PayPal</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="size-4 text-green-500" />
            安全加密支付
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-blue-500" />
            随时取消
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-500" />
            即时生效
          </span>
        </motion.div>
      </main>
    </div>
  );
}