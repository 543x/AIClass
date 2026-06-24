'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Crown, Sparkles, Settings, ChevronDown } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useUserStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all',
          'bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800',
          'border border-gray-200/50 dark:border-gray-700/50',
          'shadow-sm hover:shadow-md',
          open && 'ring-2 ring-blue-400/30'
        )}
      >
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {user.nickname || user.email}
          </span>
          {user.isPro && (
            <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Crown className="size-3" />
              会员
            </span>
          )}
        </span>
        <ChevronDown className={cn(
          'size-3.5 text-gray-400 transition-transform',
          open && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-900/95 border border-gray-100/50 dark:border-gray-800/50"
          >
            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.nickname || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  user.isPro
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                )}>
                  {user.isPro ? (
                    <><Crown className="size-3" /> 会员</>
                  ) : (
                    `剩余 ${user.remainingToday} 次免费`
                  )}
                </span>
              </div>
            </div>

            <div className="p-1">
              <button
                onClick={() => {
                  setOpen(false);
                  // TODO: 跳转设置页面
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Settings className="size-4" />
                设置
              </button>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="size-4" />
                登出
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}