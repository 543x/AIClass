'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Check, ChevronRight, Loader2 } from 'lucide-react';

interface SliderCaptchaProps {
  onSuccess: () => void;
  onReset?: () => void;
  className?: string;
}

export function SliderCaptcha({ onSuccess, onReset, className }: SliderCaptchaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const maxOffset = 260;

  // 验证成功动画
  useEffect(() => {
    if (verified) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [verified, onSuccess]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (verified) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || verified) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    let newOffset = clientX - rect.left - 24;

    if (newOffset < 0) newOffset = 0;
    if (newOffset > maxOffset) newOffset = maxOffset;

    setOffset(newOffset);

    if (newOffset >= maxOffset - 8) {
      setVerified(true);
      setIsDragging(false);
    }
  };

  const handleEnd = () => {
    if (!verified) {
      // 未验证成功则复位
      setOffset(0);
      onReset?.();
    }
    setIsDragging(false);
  };

  const progress = Math.min((offset / maxOffset) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={containerRef}
        className={cn(
          'relative h-14 w-full rounded-xl select-none transition-all duration-300',
          'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
          'border-2 shadow-inner',
          verified ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/20' : 'border-gray-200/50 dark:border-gray-600/50',
          isDragging && !verified && 'border-blue-400/70 shadow-blue-500/10'
        )}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* 背景进度条 */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-xl transition-all duration-300',
            verified
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-blue-400/30 to-blue-500/30'
          )}
          style={{ width: `${progress}%` }}
        />

        {/* 提示文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-sm font-medium transition-all duration-300 select-none',
              verified
                ? 'text-green-700 dark:text-green-300'
                : offset > 20
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {verified ? (
              <span className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                验证通过
              </span>
            ) : isDragging ? (
              '继续拖动完成验证...'
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="size-4 opacity-50" />
                拖动滑块完成验证
              </span>
            )}
          </span>
        </div>

        {/* 滑块按钮 */}
        <div
          ref={sliderRef}
          className={cn(
            'absolute top-1.5 h-11 w-11 rounded-lg shadow-lg flex items-center justify-center transition-all duration-200',
            'cursor-grab active:cursor-grabbing',
            verified
              ? 'left-[calc(100%-52px)] bg-gradient-to-r from-green-500 to-emerald-500 cursor-default shadow-green-500/30'
              : isDragging
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/30 scale-105'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 hover:shadow-blue-500/20',
            'text-white'
          )}
          style={{ left: offset }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          {verified ? (
            <Check className="size-5" />
          ) : isDragging ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ChevronRight className="size-5" />
          )}
        </div>

        {/* 验证成功后的光晕 */}
        {verified && (
          <div className="absolute inset-0 rounded-xl bg-green-500/10 animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  );
}