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
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && !request.nextUrl.searchParams.has('error')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}