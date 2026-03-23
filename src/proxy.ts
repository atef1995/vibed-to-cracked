import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
const debugMode = process.env.NODE_ENV === "development";

// Helper to generate anonymous ID
function generateAnonymousId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `anon_${random}_${timestamp}`;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (debugMode) {
    console.log("Middleware executed for:", pathname);
  }

  // Use NextAuth's getToken for proper session validation
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Legacy cookie check as fallback
  const sessionToken =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");

  const isAuthenticated = !!token || !!sessionToken;

  if (debugMode) {
    console.log("User authenticated:", isAuthenticated, "for path:", pathname);
  }

  // If we have a valid token and user is trying to access signin page, redirect to dashboard
  if (isAuthenticated && pathname.startsWith("/auth/signin")) {
    const raw = req.nextUrl.searchParams.get("callbackUrl") || "/dashboard";
    const callbackUrl =
      raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
    if (debugMode) {
      console.log(
        "Redirecting authenticated user from signin to:",
        callbackUrl
      );
    }
    return NextResponse.redirect(new URL(callbackUrl, req.url));
  }

  // Handle tutorial access - both anonymous and authenticated
  if (pathname.startsWith("/tutorials/category/")) {
    if (!isAuthenticated) {
      // Anonymous user trying to view tutorial - check anonymous limit
      const anonymousCheckResult = await handleAnonymousTutorialAccess(
        req,
        pathname
      );
      if (anonymousCheckResult) {
        return anonymousCheckResult; // Redirect to signup if limit reached or set cookie
      }
      // Allow access if under limit
      return NextResponse.next();
    } else {
      // Authenticated user - check subscription limits
      const limitCheckResult = await checkTutorialAccessLimits(
        token,
        sessionToken,
        pathname,
        req
      );
      if (debugMode) {
        console.log("🔍 Check result:", { limitCheckResult });
      }
      if (!limitCheckResult.hasAccess) {
        if (debugMode) {
          console.log(`🚫 Tutorial access denied: ${limitCheckResult.reason}`);
        }
        // Redirect to subscription upgrade page with context
        const upgradeUrl = new URL("/subscription/upgrade", req.url);
        upgradeUrl.searchParams.set(
          "reason",
          limitCheckResult.reason || "Access denied"
        );
        upgradeUrl.searchParams.set("feature", "tutorials");
        upgradeUrl.searchParams.set("returnUrl", pathname);

        return NextResponse.redirect(upgradeUrl);
      } else {
        if (debugMode) {
          console.log(" Tutorial access granted");
        }
      }
    }
  }

  // Check if the route requires authentication (non-tutorial routes)
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    if (debugMode) {
      console.log("Redirecting unauthenticated user to signin for:", pathname);
    }
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
}

/**
 * Handle anonymous tutorial access with limits
 * Returns NextResponse redirect if limit reached, null if allowed
 */
async function handleAnonymousTutorialAccess(
  req: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  const ANONYMOUS_TUTORIAL_LIMIT = 5;

  // Check anonymous session in cookies
  let anonymousId = req.cookies.get("vibed_anonymous_id")?.value;

  if (!anonymousId) {
    // First-time anonymous visitor - generate and set cookie
    anonymousId = generateAnonymousId();

    if (debugMode) {
      console.log(
        "First-time anonymous visitor, setting cookie and allowing tutorial access"
      );
    }

    const response = NextResponse.next();
    response.cookies.set("vibed_anonymous_id", anonymousId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  }

  // Cookie-based tutorial counting (no self-fetch needed in Edge runtime)
  const viewedCookie = req.cookies.get("vibed_tutorials_viewed")?.value;
  let viewedSlugs: string[] = [];

  try {
    if (viewedCookie) {
      viewedSlugs = JSON.parse(viewedCookie);
    }
  } catch {
    viewedSlugs = [];
  }

  // Extract tutorial slug from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const tutorialSlug = pathParts[pathParts.length - 1];

  if (!tutorialSlug) {
    return null; // Allow category listing pages
  }

  // Check if limit reached (only counts new tutorials, not revisits)
  if (
    viewedSlugs.length >= ANONYMOUS_TUTORIAL_LIMIT &&
    !viewedSlugs.includes(tutorialSlug)
  ) {
    if (debugMode) {
      console.log("Anonymous limit reached, redirecting to signup");
    }

    const signupUrl = new URL("/auth/signin", req.url);
    signupUrl.searchParams.set("callbackUrl", pathname);
    signupUrl.searchParams.set(
      "message",
      `You've viewed ${ANONYMOUS_TUTORIAL_LIMIT} tutorials! Sign up free to continue learning.`
    );
    signupUrl.searchParams.set("reason", "anonymous_limit");

    return NextResponse.redirect(signupUrl);
  }

  // Track this tutorial if not already viewed
  if (!viewedSlugs.includes(tutorialSlug)) {
    viewedSlugs.push(tutorialSlug);
    const response = NextResponse.next();
    response.cookies.set(
      "vibed_tutorials_viewed",
      JSON.stringify(viewedSlugs),
      {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      }
    );
    return response;
  }

  if (debugMode) {
    console.log(
      `Anonymous access granted (${viewedSlugs.length}/${ANONYMOUS_TUTORIAL_LIMIT})`
    );
  }
  return null;
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    "/settings",
    "/store/orders", // Order history requires authentication
  ];

  return protectedRoutes.some((route) => {
    // Exact match for routes with trailing slash
    if (route.endsWith("/")) {
      // Match /quiz/123 but not /quizzes
      return pathname.startsWith(route) && pathname !== route.slice(0, -1);
    }
    return pathname.startsWith(route);
  });
}

interface TutorialAccessResult {
  hasAccess: boolean;
  reason?: string;
  suggestedPlan?: string;
}

async function checkTutorialAccessLimits(
  _token: JWT | null,
  _sessionToken: { name: string; value: string } | undefined,
  _pathname: string,
  _req: NextRequest
): Promise<TutorialAccessResult> {
  // Premium tutorial gating is enforced at the page level where Prisma is available.
  // Edge middleware cannot reliably self-fetch internal APIs in containerized deployments.
  return { hasAccess: true };
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/tutorials/category/:path*",
    "/auth/:path*",
    "/store/orders/:path*",
  ],
};
