'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import { SliderCaptcha } from './SliderCaptcha';
import { useUserStore } from '@/lib/store/userStore';
import { cn } from '@/lib/utils';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { login, register } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 切换登录/注册时重置验证状态
  useEffect(() => {
    setCaptchaVerified(false);
    setError('');
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError('请先完成滑块验证');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password.length < 6) {
          setError('密码至少6位');
          setLoading(false);
          return;
        }
        await register(email, password, nickname);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* 头部 */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isLogin ? '欢迎回来' : '创建账号'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isLogin ? '登录以继续学习之旅' : '开启你的 AI 学习之旅'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-4">
          {!isLogin && (
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500">
                <User className="size-4" />
              </div>
              <input
                type="text"
                placeholder="昵称（选填）"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:bg-gray-800"
              />
            </div>
          )}

          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500">
              <Mail className="size-4" />
            </div>
            <input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:bg-gray-800"
              required
            />
          </div>

          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500">
              <Lock className="size-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-12 text-sm transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:bg-gray-800"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* 滑块验证 */}
          <SliderCaptcha
            onSuccess={() => setCaptchaVerified(true)}
            onReset={() => setCaptchaVerified(false)}
            className="pt-1"
          />

          {/* 错误信息 */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading || !captchaVerified}
            className={cn(
              'relative w-full overflow-hidden rounded-xl py-3.5 font-semibold text-white transition-all',
              'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25',
              'hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              loading && 'cursor-wait'
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                处理中...
              </span>
            ) : (
              isLogin ? '登录' : '创建账号'
            )}
          </button>

          {/* 切换模式 */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-gray-500 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？去登录'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}