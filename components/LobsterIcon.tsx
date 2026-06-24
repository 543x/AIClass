'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LobsterIconProps {
  className?: string;
  size?: number; // 像素
  onHover?: () => void;
}

export function LobsterIcon({ className, size = 100, onHover }: LobsterIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 动态注入 CSS 动画（确保只在客户端执行）
    const styleId = 'lobster-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes clawSnap {
          0%, 85%, 100% { transform: rotate(0deg); }
          90% { transform: rotate(-8deg); }
          95% { transform: rotate(0deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .lobster-icon-animated {
          animation: float 4s ease-in-out infinite;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .lobster-icon-animated:hover {
          transform: scale(1.1);
          animation: none;
        }
        .lobster-icon-animated svg {
          filter: drop-shadow(0 0 20px rgba(255, 77, 77, 0.3));
          transition: filter 0.3s ease;
        }
        .lobster-icon-animated:hover svg {
          filter: drop-shadow(0 0 30px rgba(255, 77, 77, 0.5));
        }
        .lobster-icon-animated .eye-glow {
          animation: blink 3s ease-in-out infinite;
        }
        .lobster-icon-animated .antenna {
          animation: wiggle 2s ease-in-out infinite;
          transform-origin: center;
        }
        .lobster-icon-animated .claw-left {
          animation: clawSnap 4s ease-in-out infinite;
          transform-origin: right center;
        }
        .lobster-icon-animated .claw-right {
          animation: clawSnap 4s ease-in-out infinite 0.2s;
          transform-origin: left center;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      ref={iconRef}
      className={cn('lobster-icon-animated', className)}
      style={{ width: size, height: size }}
      onMouseEnter={onHover}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 龙虾钳轮廓 */}
        <path
          d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
          fill="url(#lobster-gradient)"
          className="claw-body"
        />
        {/* 左钳 */}
        <path
          d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z"
          fill="url(#lobster-gradient)"
          className="claw-left"
        />
        {/* 右钳 */}
        <path
          d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
          fill="url(#lobster-gradient)"
          className="claw-right"
        />
        {/* 触角 */}
        <path
          d="M45 15 Q35 5 30 8"
          stroke="#ff6b6b"
          strokeWidth="2"
          strokeLinecap="round"
          className="antenna"
        />
        <path
          d="M75 15 Q85 5 90 8"
          stroke="#ff6b6b"
          strokeWidth="2"
          strokeLinecap="round"
          className="antenna"
        />
        {/* 眼睛 */}
        <circle cx="45" cy="35" r="6" fill="#050810" className="eye" />
        <circle cx="75" cy="35" r="6" fill="#050810" className="eye" />
        <circle cx="46" cy="34" r="2" fill="#00e5cc" className="eye-glow" />
        <circle cx="76" cy="34" r="2" fill="#00e5cc" className="eye-glow" />
        <defs>
          <linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#ee5a24" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}