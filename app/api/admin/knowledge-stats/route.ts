// 2026-08-29: `supabase` WAS NEVER DECLARED IN THIS FILE.
// getSupabase() is defined here and was called by NOTHING; every database call
// referenced a bare `supabase` that does not exist, so each one threw
// ReferenceError at runtime. TS2304 said so plainly once this repo got a
// typecheck.
//
// Same defect as /api/auth in core, which imported createClient and referenced an
// undeclared `supabase` in every branch — every call returned 500 and the reason
// was invisible because nothing checked types.
//
// Each call site now goes through the factory. It is a lazy service client with
// persistSession:false, so calling it per statement is correct rather than
// wasteful, and it avoids a module-scope client — which is what breaks `next
// build` when a route is evaluated at build time.

/**
 * JAVARI AI - KNOWLEDGE STATISTICS API
 * Get real-time knowledge base statistics
 */

import { NextResponse } from 'next/server';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  const { createClient } = require('@supabase/supabase-js')
  const url = supabaseUrl()
  const key = secretKey()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}



export async function GET() {
  try {
    // Get total pages
    const { count: totalPages } = await getSupabase()
      .from('documentation_pages')
      .select('*', { count: 'exact', head: true });

    // Get pages with embeddings
    const { count: withEmbeddings } = await getSupabase()
      .from('documentation_pages')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    // Get unique categories
    const { data: categoriesData } = await getSupabase()
      .from('documentation_pages')
      .select('metadata->category')
      .not('metadata->category', 'is', null);

    const uniqueCategories = new Set(
      categoriesData?.map((r: any) => r.category).filter(Boolean)
    );

    // Get by category
    const { data: allPages } = await getSupabase()
      .from('documentation_pages')
      .select('metadata');

    const byCategory: Record<string, number> = {};
    allPages?.forEach((page: any) => {
      const category = page.metadata?.category;
      if (category) {
        byCategory[category] = (byCategory[category] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      totalPages: totalPages || 0,
      withEmbeddings: withEmbeddings || 0,
      categories: uniqueCategories.size,
      byCategory,
      embeddingCoverage: totalPages ? Math.round((withEmbeddings / totalPages) * 100) : 0,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Knowledge Stats] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
