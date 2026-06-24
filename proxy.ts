// E:\OpenMAIC\proxy.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔐 OpenMAIC Proxy 函数
 * 保留用户系统 Session 验证，移除 ACCESS_CODE
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================================
  // 1. 白名单：无需任何验证的路径
  // ============================================================
  const publicPaths = [
    '/api/health',        // 健康检查
    '/api/auth/login',    // 登录接口
    '/api/auth/register', // 注册接口
    '/_next/static',      // 静态资源
    '/_next/image',
    '/favicon.ico',
    '/logos/',
  ];

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ============================================================
  // 2. 🔥 用户系统 Session 验证（API 路由保护）
  // ============================================================
  const protectedApiPaths = [
    '/api/usage',
    '/api/payment/',
    '/api/generate',
    '/api/user/',
    '/api/subscription/',
  ];

  if (protectedApiPaths.some((p) => pathname.startsWith(p))) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'UNAUTHORIZED',
          error: '请先登录',
        },
        { status: 401 },
      );
    }
  }

  // ============================================================
  // 3. 默认放行
  // ============================================================
  return NextResponse.next();
}

// ============================================================
// 4. 路径匹配配置
// ============================================================
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logos/).*)',
  ],
};