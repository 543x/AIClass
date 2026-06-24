'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { XCircle, ArrowLeft, Sparkles } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 to-slate-50 dark:from-red-950/20 dark:to-slate-950"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30"
        >
          <XCircle className="size-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            支付已取消
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            你可以随时回来升级，享受 Pro 会员权益
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <button
            onClick={() => router.push('/upgrade')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3.5 font-semibold text-white transition hover:bg-blue-600 shadow-lg shadow-blue-500/25"
          >
            <ArrowLeft className="size-4" />
            返回升级
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
          >
            返回首页
          </button>
        </motion.div>

        {/* 挽回提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-gray-400"
        >
          <p>💡 提示：Pro 会员让你无限使用 AI 课堂生成</p>
          <p className="mt-1">🎁 年度会员额外赠送 2 个月</p>
        </motion.div>
      </div>
    </motion.div>
  );
}