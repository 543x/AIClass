'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, Loader2, ArrowRight, Crown } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { useMembership } from '@/hooks/use-membership';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useUserStore();
  const { membership, refresh } = useMembership();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const orderId = searchParams.get('token');
    if (orderId) {
      // Webhook 会处理，前端只需等待
      setStatus('processing');
    } else {
      // 直接访问 success 页面（可能是已支付完成）
      setStatus('success');
    }
  }, [searchParams]);

  // 等待会员状态更新
  useEffect(() => {
    if (status === 'processing') {
      let attempts = 0;
      const maxAttempts = 30; // 30 次 * 500ms = 15 秒

      const checkStatus = async () => {
        attempts++;
        await refresh();
        if (membership.isPro) {
          setStatus('success');
          await fetchUser();
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 500);
        } else {
          setStatus('error');
        }
      };

      const timer = setTimeout(checkStatus, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, membership.isPro, refresh, fetchUser]);

  // 倒计时自动跳转
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, router]);

  if (status === 'processing') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950">
        <Loader2 className="size-12 animate-spin text-blue-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
          正在确认支付...
        </h2>
        <p className="mt-2 text-sm text-gray-400">请稍候，会员即将激活</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 to-slate-50 dark:from-red-950/20 dark:to-slate-950">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30">
            <Check className="size-10" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            支付确认中
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            支付已成功，但会员激活可能稍有延迟
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            返回首页
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-slate-50 dark:from-green-950/20 dark:to-slate-950"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900/30"
        >
          <Check className="size-12" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            🎉 升级成功！
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            你现在已经拥有 Pro 会员资格，享受全部功能
          </p>
          {membership.remainingDays > 0 && (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              会员有效期至 {new Date(membership.endDate!).toLocaleDateString('zh-TW')}
              （剩余 {membership.remainingDays} 天）
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 font-semibold text-white transition hover:bg-blue-600 shadow-lg shadow-blue-500/25"
          >
            立即体验 Pro
            <ArrowRight className="size-4" />
          </button>
          <p className="text-sm text-gray-400">
            {countdown > 0 ? `${countdown} 秒后自动跳转...` : '跳转中...'}
          </p>
        </motion.div>

        {/* Pro 功能预览 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-2 gap-3 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center gap-1.5">
            <Crown className="size-4 text-amber-500" />
            无限生成
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="size-4 text-green-500" />
            所有学科解锁
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}