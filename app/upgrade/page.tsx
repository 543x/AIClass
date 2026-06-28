// app/upgrade/page.tsx
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
  Zap,
  Star,
  Infinity,
} from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { useMembership } from '@/hooks/use-membership';
import { UpgradeButton } from '@/components/UpgradeButton';
import { cn } from '@/lib/utils';

const PRICES = {
  monthly: 'NT$99',
  yearly: 'NT$990',
};

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { membership, loading } = useMembership();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

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

  if (loading) {
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
      period: ' / 月',
      priceUsd: '≈ $3/月',
      features: [
        { icon: Infinity, text: '无限次 AI 课堂生成' },
        { icon: Zap, text: '所有学科全解锁' },
        { icon: Clock, text: '对话历史永久保存' },
        { icon: Star, text: '优先使用最新 AI 模型' },
        { icon: Sparkles, text: '智能体深度交互' },
      ],
      popular: false,
      badge: null,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/25',
    },
    yearly: {
      name: '年度会员',
      price: PRICES.yearly,
      period: ' / 年',
      priceUsd: '≈ $30/年',
      features: [
        { icon: Infinity, text: '无限次 AI 课堂生成' },
        { icon: Zap, text: '所有学科全解锁' },
        { icon: Clock, text: '对话历史永久保存' },
        { icon: Star, text: '优先使用最新 AI 模型' },
        { icon: Sparkles, text: '智能体深度交互' },
        { icon: Crown, text: '🎁 额外赠送 2 个月' },
      ],
      popular: true,
      badge: '省 2 个月',
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/25',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:border-gray-800/50 dark:bg-gray-900/80">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="size-4" />
            返回首页
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        {/* Hero 区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-500/30">
            <Crown className="size-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
            升级到{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Pro
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            解锁全部功能，让 AI 课堂体验更强大
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <Check className="size-3" />
              7 天免费试用
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Zap className="size-3" />
              随时取消
            </span>
          </div>
        </motion.div>

        {/* 套餐切换 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 flex justify-center"
        >
          <div className="relative flex rounded-2xl bg-gray-100/70 p-1 dark:bg-gray-800/70">
            {(['monthly', 'yearly'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium transition-all duration-300',
                  selectedPlan === plan
                    ? 'bg-white text-gray-900 shadow-lg dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {plans[plan].name}
                {plans[plan].badge && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {plans[plan].badge}
                  </span>
                )}
                {plan === 'yearly' && selectedPlan === 'yearly' && (
                  <motion.span
                    layoutId="plan-badge"
                    className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[9px] font-bold text-white"
                  >
                    最划算
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 套餐卡片 */}
        <motion.div
          key={selectedPlan}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          className="mt-8"
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900',
              plans[selectedPlan].popular && 'ring-2 ring-amber-400/50 dark:ring-amber-500/50'
            )}
          >
            {/* 装饰背景 */}
            <div
              className={cn(
                'absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-10 blur-3xl',
                selectedPlan === 'yearly' ? 'bg-amber-400' : 'bg-blue-400'
              )}
            />
            <div
              className={cn(
                'absolute -left-20 -bottom-20 h-64 w-64 rounded-full opacity-10 blur-3xl',
                selectedPlan === 'yearly' ? 'bg-orange-400' : 'bg-indigo-400'
              )}
            />

            <div className="relative p-6 md:p-10">
              <div className="grid gap-8 md:grid-cols-2 md:gap-12">
                {/* 左列：价格和功能 */}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plans[selectedPlan].name}
                    </h2>
                    {plans[selectedPlan].popular && (
                      <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/25">
                        推荐
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plans[selectedPlan].price}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      {plans[selectedPlan].period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {plans[selectedPlan].priceUsd}
                  </p>

                  <div className="mt-6 space-y-3">
                    {plans[selectedPlan].features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="size-3.5" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 右列：支付按钮 */}
                <div className="flex flex-col justify-center">
                  <div className="rounded-2xl bg-gray-50/80 p-6 dark:bg-gray-800/50">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        今日支付
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {plans[selectedPlan].price}
                      </div>
                      <div className="text-xs text-gray-400">
                        {selectedPlan === 'yearly' ? '平均 NT$82.5/月' : '按月度计费'}
                      </div>
                    </div>

                    <div className="mt-6">
                      <UpgradeButton
                        plan={selectedPlan}
                        className="w-full"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Crown className="size-4" />
                          立即升级 Pro
                        </span>
                      </UpgradeButton>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Shield className="size-3" />
                        安全加密
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        随时取消
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3" />
                        即时生效
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                      </svg>
                      <span className="text-xs text-gray-400">由 PayPal 提供安全支付</span>
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs text-gray-400">
                    💳 支持台湾地区信用卡和 PayPal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 底部信任标识 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 dark:text-gray-500"
        >
          <span className="flex items-center gap-2">
            <Shield className="size-4 text-green-500" />
            256-bit 加密
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-blue-500" />
            7×24 小时支持
          </span>
          <span className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" />
            15,000+ 用户信赖
          </span>
        </motion.div>

        {/* FAQ 提示 */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>按订阅周期计费，可随时取消 · 如有疑问请联系客服</p>
        </div>
      </main>
    </div>
  );
}