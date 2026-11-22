import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/transaksi',
  '/anggaran',
  '/tabungan',
  '/tagihan',
  '/kategori',
  '/insight',
  '/laporan',
  '/notifikasi',
  '/pengaturan',
  '/admin',
  '/api/laporan',
];

const AUTH_ROUTES = ['/masuk', '/daftar', '/lupa-sandi'];

function applySecurityHeaders(response: NextResponse, isProtected: boolean) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (isProtected) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/masuk';
    const redirectRes = NextResponse.redirect(url);
    applySecurityHeaders(redirectRes, true);
    return redirectRes;
  }

  if (user && isAuthRoute && !request.nextUrl.searchParams.has('error')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    const redirectRes = NextResponse.redirect(url);
    applySecurityHeaders(redirectRes, false);
    return redirectRes;
  }

  applySecurityHeaders(supabaseResponse, isProtected);
  return supabaseResponse;
}
