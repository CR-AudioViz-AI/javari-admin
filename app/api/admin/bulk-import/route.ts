/**
 * JAVARI AI - BULK KNOWLEDGE IMPORT API
 * Rapid knowledge ingestion from multiple source types
 * Built for speed and scale
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse as parseCSV } from 'csv-parse/sync';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ImportJob {
  id: string;
  type: 'url' | 'sitemap' | 'csv' | 'pdf' | 'rss' | 'api';
  source: string;
  category: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  processed: number;
  total: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

const jobs = new Map<string, ImportJob>();

/**
 * POST /api/admin/bulk-import
 * Start bulk import from various sources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, source, category, tags } = body;

    // Validate input
    if (!type || !source || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create job
    const jobId = `import-${Date.now()}`;
    const job: ImportJob = {
      id: jobId,
      type,
      source,
      category,
      status: 'queued',
      processed: 0,
      total: 0,
    };
    jobs.set(jobId, job);

    // Start import asynchronously
    processImport(jobId, type, source, category, tags || []).catch(error => {
      console.error(`[Job ${jobId}] Failed:`, error);
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
        job.completedAt = new Date().toISOString();
      }
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: `Import started for ${category}`,
      estimatedTime: getEstimatedTime(type),
    });

  } catch (error: any) {
    console.error('[Bulk Import] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/bulk-import?jobId=X
 * Get import job status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      const job = jobs.get(jobId);
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, job });
    }

    // Return all jobs
    const allJobs = Array.from(jobs.values());
    return NextResponse.json({ success: true, jobs: allJobs });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Process import based on type
 */
async function processImport(
  jobId: string,
  type: string,
  source: string,
  category: string,
  tags: string[]
) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date().toISOString();

  try {
    switch (type) {
      case 'sitemap':
        await importFromSitemap(job, source, category, tags);
        break;
      case 'csv':
        await importFromCSV(job, source, category, tags);
        break;
      case 'api':
        await importFromAPI(job, source, category, tags);
        break;
      case 'rss':
        await importFromRSS(job, source, category, tags);
        break;
      case 'url':
        await importFromURL(job, source, category, tags);
        break;
      default:
        throw new Error(`Unknown import type: ${type}`);
    }

    job.status = 'completed';
    job.completedAt = new Date().toISOString();

  } catch (error: any) {
    job.status = 'failed';
    job.error = error.message;
    job.completedAt = new Date().toISOString();
    throw error;
  }
}

/**
 * Import from XML sitemap (FAST - gets all URLs at once)
 */
async function importFromSitemap(
  job: ImportJob,
  sitemapUrl: string,
  category: string,
  tags: string[]
) {
  console.log(`[${job.id}] Fetching sitemap: ${sitemapUrl}`);
  
  // Fetch sitemap
  const response = await axios.get(sitemapUrl);
  const $ = cheerio.load(response.data, { xmlMode: true });
  
  // Extract all URLs
  const urls = $('loc').map((_, el) => $(el).text()).get();
  job.total = urls.length;
  
  console.log(`[${job.id}] Found ${urls.length} URLs`);

  // Create knowledge source
  const { data: source } = await supabase
    .from('knowledge_sources')
    .insert({
      name: category,
      type: 'bulk_import',
      url: sitemapUrl,
      status: 'active',
      metadata: { category, tags, import_method: 'sitemap' },
    })
    .select('id')
    .single();

  if (!source) throw new Error('Failed to create knowledge source');

  // Process URLs in batches of 10
  const batchSize = 10;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(
      batch.map(url => processPage(url, source.id, category, tags))
    );
    job.processed = Math.min(i + batchSize, urls.length);
    
    // Rate limiting
    await sleep(2000);
  }
}

/**
 * Import from CSV file (FASTEST - already structured)
 */
async function importFromCSV(
  job: ImportJob,
  csvUrl: string,
  category: string,
  tags: string[]
) {
  console.log(`[${job.id}] Fetching CSV: ${csvUrl}`);
  
  // Fetch CSV
  const response = await axios.get(csvUrl);
  const records = parseCSV(response.data, {
    columns: true,
    skip_empty_lines: true,
  });
  
  job.total = records.length;
  console.log(`[${job.id}] Found ${records.length} records`);

  // Create knowledge source
  const { data: source } = await supabase
    .from('knowledge_sources')
    .insert({
      name: category,
      type: 'bulk_import',
      url: csvUrl,
      status: 'active',
      metadata: { category, tags, import_method: 'csv' },
    })
    .select('id')
    .single();

  if (!source) throw new Error('Failed to create knowledge source');

  // Process records in batches
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await Promise.all(
      batch.map(record => processCSVRecord(record, source.id, category, tags))
    );
    job.processed = Math.min(i + batchSize, records.length);
  }
}

/**
 * Import from API endpoint (JSON/XML)
 */
async function importFromAPI(
  job: ImportJob,
  apiUrl: string,
  category: string,
  tags: string[]
) {
  console.log(`[${job.id}] Fetching API: ${apiUrl}`);
  
  // Fetch from API
  const response = await axios.get(apiUrl);
  const data = response.data;
  
  // Handle different API response formats
  let items = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data.data && Array.isArray(data.data)) {
    items = data.data;
  } else if (data.results && Array.isArray(data.results)) {
    items = data.results;
  } else {
    throw new Error('Unknown API response format');
  }
  
  job.total = items.length;
  console.log(`[${job.id}] Found ${items.length} items`);

  // Create knowledge source
  const { data: source } = await supabase
    .from('knowledge_sources')
    .insert({
      name: category,
      type: 'bulk_import',
      url: apiUrl,
      status: 'active',
      metadata: { category, tags, import_method: 'api' },
    })
    .select('id')
    .single();

  if (!source) throw new Error('Failed to create knowledge source');

  // Process items
  const batchSize = 20;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(
      batch.map(item => processAPIItem(item, source.id, category, tags))
    );
    job.processed = Math.min(i + batchSize, items.length);
  }
}

/**
 * Import from RSS feed (for continuous updates)
 */
async function importFromRSS(
  job: ImportJob,
  rssUrl: string,
  category: string,
  tags: string[]
) {
  console.log(`[${job.id}] Fetching RSS: ${rssUrl}`);
  
  const response = await axios.get(rssUrl);
  const $ = cheerio.load(response.data, { xmlMode: true });
  
  // Extract items
  const items = $('item').map((_, el) => ({
    title: $(el).find('title').text(),
    link: $(el).find('link').text(),
    description: $(el).find('description').text(),
    pubDate: $(el).find('pubDate').text(),
  })).get();
  
  job.total = items.length;
  console.log(`[${job.id}] Found ${items.length} RSS items`);

  // Create knowledge source with RSS subscription
  const { data: source } = await supabase
    .from('knowledge_sources')
    .insert({
      name: category,
      type: 'rss_feed',
      url: rssUrl,
      status: 'active',
      metadata: { 
        category, 
        tags, 
        import_method: 'rss',
        auto_update: true,
        update_frequency: 'daily',
      },
    })
    .select('id')
    .single();

  if (!source) throw new Error('Failed to create knowledge source');

  // Process items
  for (let i = 0; i < items.length; i++) {
    await processRSSItem(items[i], source.id, category, tags);
    job.processed = i + 1;
  }
}

/**
 * Import from single URL
 */
async function importFromURL(
  job: ImportJob,
  url: string,
  category: string,
  tags: string[]
) {
  job.total = 1;
  
  const { data: source } = await supabase
    .from('knowledge_sources')
    .insert({
      name: category,
      type: 'single_url',
      url,
      status: 'active',
      metadata: { category, tags, import_method: 'url' },
    })
    .select('id')
    .single();

  if (!source) throw new Error('Failed to create knowledge source');

  await processPage(url, source.id, category, tags);
  job.processed = 1;
}

/**
 * Process a single page
 */
async function processPage(
  url: string,
  sourceId: string,
  category: string,
  tags: string[]
) {
  try {
    // Fetch page
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('nav, footer, script, style, .ad, .sidebar').remove();
    
    // Extract content
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const content = $('article, main, .content, body').text().trim();
    
    if (!content || content.length < 100) {
      console.log(`Skipping ${url} - insufficient content`);
      return;
    }

    // Clean content
    const cleanContent = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Generate embedding
    const embedding = await generateEmbedding(`${title}\n\n${cleanContent}`);

    // Save to database
    await supabase.from('documentation_pages').insert({
      source_id: sourceId,
      url,
      title,
      content: cleanContent,
      embedding: JSON.stringify(embedding),
      embedding_model: 'text-embedding-3-small',
      embedding_generated_at: new Date().toISOString(),
      metadata: { category, tags },
    });

    console.log(`Processed: ${title}`);

  } catch (error) {
    console.error(`Failed to process ${url}:`, error);
  }
}

/**
 * Process CSV record
 */
async function processCSVRecord(
  record: any,
  sourceId: string,
  category: string,
  tags: string[]
) {
  try {
    // Combine all fields into content
    const content = Object.entries(record)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const title = record.title || record.name || `${category} Entry`;

    const embedding = await generateEmbedding(`${title}\n\n${content}`);

    await supabase.from('documentation_pages').insert({
      source_id: sourceId,
      url: record.url || `csv://${sourceId}/${record.id || Date.now()}`,
      title,
      content,
      embedding: JSON.stringify(embedding),
      embedding_model: 'text-embedding-3-small',
      embedding_generated_at: new Date().toISOString(),
      metadata: { category, tags, ...record },
    });

  } catch (error) {
    console.error('Failed to process CSV record:', error);
  }
}

/**
 * Process API item
 */
async function processAPIItem(
  item: any,
  sourceId: string,
  category: string,
  tags: string[]
) {
  try {
    const title = item.title || item.name || item.heading;
    const content = item.content || item.description || item.body || JSON.stringify(item);

    const embedding = await generateEmbedding(`${title}\n\n${content}`);

    await supabase.from('documentation_pages').insert({
      source_id: sourceId,
      url: item.url || item.link || `api://${sourceId}/${item.id}`,
      title,
      content,
      embedding: JSON.stringify(embedding),
      embedding_model: 'text-embedding-3-small',
      embedding_generated_at: new Date().toISOString(),
      metadata: { category, tags, ...item },
    });

  } catch (error) {
    console.error('Failed to process API item:', error);
  }
}

/**
 * Process RSS item
 */
async function processRSSItem(
  item: any,
  sourceId: string,
  category: string,
  tags: string[]
) {
  try {
    const content = `${item.title}\n\n${item.description}`;
    const embedding = await generateEmbedding(content);

    await supabase.from('documentation_pages').insert({
      source_id: sourceId,
      url: item.link,
      title: item.title,
      content: item.description,
      embedding: JSON.stringify(embedding),
      embedding_model: 'text-embedding-3-small',
      embedding_generated_at: new Date().toISOString(),
      metadata: { 
        category, 
        tags,
        pubDate: item.pubDate,
      },
    });

  } catch (error) {
    console.error('Failed to process RSS item:', error);
  }
}

/**
 * Generate embedding
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const truncated = text.length > 32000 ? text.substring(0, 32000) : text;
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncated,
  });

  return response.data[0].embedding;
}

/**
 * Estimate processing time
 */
function getEstimatedTime(type: string): string {
  const estimates: Record<string, string> = {
    csv: '5-15 minutes',
    api: '10-30 minutes',
    sitemap: '30-60 minutes',
    rss: '5-10 minutes',
    url: '1-2 minutes',
  };
  return estimates[type] || '15-45 minutes';
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
