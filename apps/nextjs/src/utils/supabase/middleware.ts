/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  authRoutes,
  DEFAULT_AUTH_ROUTE,
  DEFAULT_LOGIN_REDIRECT,
  protectedRoutes,
} from "~/config/routes";
import { env } from "~/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If protected route and user is not authenticated, redirect to signin
  const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname);

  if (isProtectedRoute && !user) {
    const url = new URL(DEFAULT_AUTH_ROUTE, request.url);
    return NextResponse.redirect(url);
  }

  // Forward authed user to DEFAULT_LOGIN_REDIRECT if auth route
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

  if (isAuthRoute && user) {
    const url = new URL(DEFAULT_LOGIN_REDIRECT, request.url);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
