'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PayPalButtonProps {
  plan: 'monthly' | 'yearly';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  fullWidth?: boolean;
  className?: string;
}

export function PayPalButton({
  plan,
  onSuccess,
  onError,
  fullWidth = true,
  className,
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayPalPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '创建订单失败');
      }

      if (data.approvalUrl) {
        // 跳转到 PayPal
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('未获取到支付链接');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '支付初始化失败';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
      <button
        onClick={handlePayPalPayment}
        disabled={loading}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all',
          'bg-[#0070ba] hover:bg-[#003087]',
          'shadow-lg shadow-[#0070ba]/25 hover:shadow-xl',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          loading && 'cursor-wait',
          fullWidth && 'w-full'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            正在跳转 PayPal...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.563 2.75-2.158 4.075-4.76 4.075h-2.83c-.422 0-.768.303-.829.712l-.307 1.956-.048.304c-.087.58-.495.978-1.071.978h-.804l.43 2.753 1.193 6.508z"/>
            </svg>
            使用 PayPal 付款
          </>
        )}
      </button>

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}