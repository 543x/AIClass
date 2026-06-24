'use client';

import { motion } from 'motion/react';
import { X, Crown, Sparkles, Zap, Check } from 'lucide-react';

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade?: () => void;
}

export function PaywallModal({ onClose, onUpgrade }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500" />

        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                <Crown className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  🚀 今日免费次数已用完
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  升级 Pro 解锁无限学习
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* Pro 权益 */}
          <div className="space-y-2 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:from-amber-950/20 dark:to-orange-950/20">
            <p className="font-medium text-amber-800 dark:text-amber-300">Pro 会员权益</p>
            {[
              '无限次 AI 课堂生成',
              '所有学科全解锁',
              '优先使用最新 AI 模型',
              '智能体深度交互',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="size-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>

          {/* 价格 */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-blue-100 p-3 text-center dark:border-blue-900/30">
              <p className="text-xs text-gray-400">月度</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">NT$65</p>
              <p className="text-[10px] text-gray-400">≈ $2/月</p>
            </div>
            <div className="relative rounded-xl border-2 border-amber-400 bg-amber-50/50 p-3 text-center dark:border-amber-600 dark:bg-amber-900/20">
              <span className="absolute -top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">推荐</span>
              <p className="text-xs text-gray-400">年度</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">NT$650</p>
              <p className="text-[10px] text-gray-400">≈ $20/年</p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onUpgrade?.();
            }}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 font-semibold text-white transition hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25"
          >
            ⚡ 升级 Pro
          </button>

          <button
            onClick={onClose}
            className="mt-2 w-full rounded-xl py-2.5 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            明天再说
          </button>
        </div>
      </motion.div>
    </div>
  );
}