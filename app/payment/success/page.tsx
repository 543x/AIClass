// app/payment/success/page.tsx
import { Suspense } from 'react';
import PaymentSuccessContent from './PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950">
        <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}