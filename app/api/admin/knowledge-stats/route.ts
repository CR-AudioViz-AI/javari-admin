/**
 * JAVARI AI - KNOWLEDGE STATISTICS API
 * Get real-time knowledge base statistics
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get total pages
    const { count: totalPages } = await supabase
      .from('documentation_pages')
      .select('*', { count: 'exact', head: true });

    // Get pages with embeddings
    const { count: withEmbeddings } = await supabase
      .from('documentation_pages')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    // Get unique categories
    const { data: categoriesData } = await supabase
      .from('documentation_pages')
      .select('metadata->category')
      .not('metadata->category', 'is', null);

    const uniqueCategories = new Set(
      categoriesData?.map((r: any) => r.category).filter(Boolean)
    );

    // Get by category
    const { data: allPages } = await supabase
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
