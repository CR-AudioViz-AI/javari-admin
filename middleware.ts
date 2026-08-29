// middleware.ts — nothing in this app is public
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY
//
// 2026-08-29: https://javari-admin.vercel.app/admin/knowledge returned 200 to
// anyone on the internet. Verified against production. The Vercel project had
// ssoProtection null, passwordProtection null and trustedIps null, all three of
// this repo's API routes sit under /api/admin/ with no gate on any of them, and
// there was no middleware.
//
// The intended fix was Vercel Deployment Protection, which closes the whole
// project in one setting. It is not available:
//
//   ssoProtection      "Vercel Authentication is not available on your plan
//                       for production deployments"                    HTTP 428
//   passwordProtection "Advanced Deployment Protection is not enabled on
//                       your team"                                     HTTP 428
//
// SSO was enabled for PREVIEW deployments, which the plan does allow, and that
// is all the platform will give without a paid add-on. Production needed
// closing another way, so it is closed here instead — in code, free, and
// reversible by deleting this file.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY HTTP BASIC AND NOT A LOGIN PAGE
//
// This is an internal knowledge-import console, not a product. Basic auth needs
// no login UI, no session store and no user table: the browser prompts, and
// every subsequent request carries the header. Building a real sign-in flow for
// a two-page internal tool would be a week of work protecting the same thing.
//
// It runs over HTTPS only — Vercel terminates TLS and redirects http, so the
// credential is never sent in clear.
//
// IT FAILS CLOSED. If ADMIN_BASIC_USER or ADMIN_BASIC_PASS is unset or short,
// every request is refused with 503. A missing credential is a refusal, never a
// default — the same rule requireAdminSecret follows, and for the same reason:
// six routes on the platform were once "gated" by a literal published in their
// own source while the environment variable was unset.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · 2026-08-29

import { NextRequest, NextResponse } from "next/server";

/**
 * Compare every byte of the longer string either way, so the time taken does
 * not depend on how many leading characters happened to match.
 */
function equals(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="javari-admin", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest): NextResponse {
  const user = process.env.ADMIN_BASIC_USER ?? "";
  const pass = process.env.ADMIN_BASIC_PASS ?? "";

  // Unconfigured is a refusal, not an opening.
  if (user.length < 3 || pass.length < 16) {
    console.error(JSON.stringify({
      level: "ERROR",
      event: "ADMIN_BASIC_UNCONFIGURED",
      message: "ADMIN_BASIC_USER / ADMIN_BASIC_PASS unset or too short; refusing every request",
    }));
    return new NextResponse("This deployment is not configured.", { status: 503 });
  }

  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }

  // Split on the FIRST colon only — a password may legitimately contain one.
  const idx = decoded.indexOf(":");
  if (idx < 0) return unauthorized();
  const gotUser = decoded.slice(0, idx);
  const gotPass = decoded.slice(idx + 1);

  // Both compared every time; no early return that would reveal which half failed.
  const ok = equals(gotUser, user) && equals(gotPass, pass);
  return ok ? NextResponse.next() : unauthorized();
}

export const config = {
  // Everything except Next's own static output. There is no public surface in
  // this app to carve out — an allowlist here would be a list of holes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
