// components/UpgradeButton.tsx
'use client';

import { useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';

interface UpgradeButtonProps {
  plan?: 'monthly' | 'yearly';
  children?: React.ReactNode;
  className?: string;
}

export function UpgradeButton({ plan = 'monthly', children, className }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '创建订阅失败');
      }

      location.assign(data.approvalUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '订阅失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            处理中...
          </>
        ) : (
          <>
            <Crown className="size-4" />
            {children || '升级 Pro'}
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}