/**
 * JAVARI AI - KNOWLEDGE VERIFICATION TEST SUITE
 * 110 questions across 5 priority domains
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Test questions by category
const TEST_QUESTIONS = {
  digital_products: [
    { q: 'How do I price a digital course?', keywords: ['pricing', 'value', 'market', 'competition'] },
    { q: 'What payment gateway should I use for digital products?', keywords: ['stripe', 'paypal', 'payment', 'gateway'] },
    { q: 'How do I market my ebook?', keywords: ['marketing', 'email', 'social', 'promotion'] },
    { q: 'What platform is best for selling online courses?', keywords: ['teachable', 'thinkific', 'kajabi', 'platform'] },
    { q: 'How do I handle refunds for digital products?', keywords: ['refund', 'policy', 'customer', 'service'] },
    { q: 'What are the best practices for course creation?', keywords: ['curriculum', 'video', 'engagement', 'content'] },
    { q: 'How do I protect my digital products from piracy?', keywords: ['drm', 'protection', 'security', 'watermark'] },
    { q: 'What is the average conversion rate for digital products?', keywords: ['conversion', 'sales', 'rate', 'percentage'] },
    { q: 'How do I build an email list for my digital products?', keywords: ['email', 'list', 'subscribers', 'lead magnet'] },
    { q: 'What are the tax implications of selling digital products?', keywords: ['tax', 'sales tax', 'vat', 'compliance'] },
    { q: 'How do I create a sales funnel for digital products?', keywords: ['funnel', 'lead', 'conversion', 'automation'] },
    { q: 'What is the best way to deliver digital products?', keywords: ['delivery', 'download', 'access', 'platform'] },
    { q: 'How do I handle customer support for online courses?', keywords: ['support', 'customer service', 'help desk'] },
    { q: 'What metrics should I track for digital product sales?', keywords: ['metrics', 'analytics', 'kpi', 'performance'] },
    { q: 'How do I launch a digital product successfully?', keywords: ['launch', 'marketing', 'strategy', 'promotion'] },
    { q: 'What are upsell strategies for digital products?', keywords: ['upsell', 'cross-sell', 'bundle', 'increase revenue'] },
    { q: 'How do I create compelling product descriptions?', keywords: ['copywriting', 'benefits', 'features', 'persuasion'] },
    { q: 'What is the best pricing strategy for subscription products?', keywords: ['subscription', 'recurring', 'pricing', 'tiers'] },
    { q: 'How do I reduce cart abandonment?', keywords: ['cart', 'abandonment', 'checkout', 'conversion'] },
    { q: 'What platforms allow selling on my own domain?', keywords: ['self-hosted', 'white label', 'custom domain'] },
  ],

  real_estate: [
    { q: 'What is the BRRRR method in real estate?', keywords: ['brrrr', 'buy', 'rehab', 'rent', 'refinance', 'repeat'] },
    { q: 'How do I qualify for an FHA loan?', keywords: ['fha', 'loan', 'qualify', 'credit', 'down payment'] },
    { q: 'What is cap rate and how is it calculated?', keywords: ['cap rate', 'noi', 'property value', 'return'] },
    { q: 'How much should I offer below asking price?', keywords: ['offer', 'negotiation', 'asking price', 'market'] },
    { q: 'What are closing costs when buying a home?', keywords: ['closing costs', 'fees', 'escrow', 'title'] },
    { q: 'How do I analyze a rental property deal?', keywords: ['analysis', 'cash flow', 'roi', 'expenses'] },
    { q: 'What is a 1031 exchange?', keywords: ['1031', 'tax deferred', 'exchange', 'like-kind'] },
    { q: 'How do I finance my first investment property?', keywords: ['financing', 'loan', 'down payment', 'investment'] },
    { q: 'What is house hacking?', keywords: ['house hacking', 'live', 'rent', 'reduce expenses'] },
    { q: 'How do I find good real estate deals?', keywords: ['find', 'deals', 'mls', 'off-market'] },
    { q: 'What are the best markets for rental properties?', keywords: ['markets', 'rental', 'appreciation', 'cash flow'] },
    { q: 'How do I calculate cash-on-cash return?', keywords: ['cash on cash', 'return', 'cash flow', 'investment'] },
    { q: 'What is a good rent to price ratio?', keywords: ['rent', 'price ratio', '1% rule', 'screening'] },
    { q: 'How do I screen tenants effectively?', keywords: ['tenant screening', 'background check', 'credit', 'references'] },
    { q: 'What repairs can I deduct from security deposit?', keywords: ['security deposit', 'deductions', 'damage', 'normal wear'] },
    { q: 'How do I evict a tenant legally?', keywords: ['eviction', 'process', 'notice', 'legal'] },
    { q: 'What insurance do I need for rental property?', keywords: ['insurance', 'landlord', 'liability', 'property'] },
    { q: 'How do I set competitive rental prices?', keywords: ['rent', 'pricing', 'market rate', 'comps'] },
    { q: 'What are common property management mistakes?', keywords: ['property management', 'mistakes', 'avoid'] },
    { q: 'How do I reduce vacancy rates?', keywords: ['vacancy', 'occupancy', 'marketing', 'retention'] },
    { q: 'What is seller financing?', keywords: ['seller financing', 'owner financing', 'terms'] },
    { q: 'How do I flip houses profitably?', keywords: ['flip', 'rehab', 'arv', 'profit'] },
    { q: 'What are the risks of real estate investing?', keywords: ['risks', 'market', 'vacancy', 'repairs'] },
    { q: 'How do I find a good real estate agent?', keywords: ['agent', 'realtor', 'investor-friendly'] },
    { q: 'What is earnest money?', keywords: ['earnest money', 'deposit', 'good faith'] },
  ],

  vacation_rentals: [
    { q: 'How do I become an Airbnb Superhost?', keywords: ['superhost', 'requirements', 'rating', 'reviews'] },
    { q: 'What is dynamic pricing for vacation rentals?', keywords: ['dynamic pricing', 'revenue', 'occupancy', 'seasonality'] },
    { q: 'Should I allow pets in my rental?', keywords: ['pets', 'policy', 'damage', 'demand'] },
    { q: 'How do I optimize my Airbnb listing?', keywords: ['listing', 'photos', 'description', 'amenities'] },
    { q: 'What are the best amenities for vacation rentals?', keywords: ['amenities', 'wifi', 'hot tub', 'kitchen'] },
    { q: 'How do I handle difficult guests?', keywords: ['guests', 'conflict', 'resolution', 'communication'] },
    { q: 'What cleaning standards should I maintain?', keywords: ['cleaning', 'standards', 'checklist', 'turnover'] },
    { q: 'How much can I charge for cleaning fees?', keywords: ['cleaning fee', 'pricing', 'competitive'] },
    { q: 'What insurance do I need for short-term rentals?', keywords: ['insurance', 'str', 'liability', 'airbnb'] },
    { q: 'How do I get more 5-star reviews?', keywords: ['reviews', '5-star', 'guest experience', 'hospitality'] },
    { q: 'What are Airbnb hosting fees?', keywords: ['fees', 'host', 'service fee', 'percentage'] },
    { q: 'How do I automate my vacation rental?', keywords: ['automation', 'self check-in', 'smart lock', 'messaging'] },
    { q: 'Should I hire a property manager?', keywords: ['property manager', 'management', 'fees', 'worth it'] },
    { q: 'What are peak seasons for vacation rentals?', keywords: ['peak season', 'high season', 'demand', 'pricing'] },
    { q: 'How do I handle maintenance issues remotely?', keywords: ['maintenance', 'remote', 'handyman', 'vendors'] },
    { q: 'What is minimum stay and when should I use it?', keywords: ['minimum stay', 'night minimum', 'strategy'] },
    { q: 'How do I deal with bad reviews?', keywords: ['bad review', 'respond', 'damage control'] },
    { q: 'What are Airbnb Plus requirements?', keywords: ['airbnb plus', 'premium', 'standards', 'verified'] },
    { q: 'How do I list on multiple platforms?', keywords: ['multi-platform', 'vrbo', 'booking.com', 'sync'] },
    { q: 'What are local STR regulations I should know?', keywords: ['regulations', 'permit', 'zoning', 'legal'] },
  ],

  legal: [
    { q: 'What is a living trust?', keywords: ['living trust', 'estate planning', 'probate', 'assets'] },
    { q: 'How do I form an LLC?', keywords: ['llc', 'formation', 'articles', 'operating agreement'] },
    { q: 'What is fair housing law?', keywords: ['fair housing', 'discrimination', 'protected class'] },
    { q: 'Do I need a business license?', keywords: ['business license', 'permit', 'requirements'] },
    { q: 'What is the difference between LLC and S-Corp?', keywords: ['llc', 's-corp', 'tax', 'structure'] },
    { q: 'How do I trademark my business name?', keywords: ['trademark', 'uspto', 'registration', 'protection'] },
    { q: 'What should be in an employment contract?', keywords: ['employment contract', 'terms', 'at-will', 'non-compete'] },
    { q: 'How do I protect my intellectual property?', keywords: ['ip', 'patent', 'copyright', 'trademark'] },
    { q: 'What is a non-disclosure agreement?', keywords: ['nda', 'confidentiality', 'agreement'] },
    { q: 'How do I handle a lawsuit against my business?', keywords: ['lawsuit', 'litigation', 'defense', 'attorney'] },
    { q: 'What are the requirements for a valid contract?', keywords: ['contract', 'offer', 'acceptance', 'consideration'] },
    { q: 'How do I dissolve an LLC?', keywords: ['dissolve', 'llc', 'termination', 'process'] },
    { q: 'What is workers compensation insurance?', keywords: ['workers comp', 'insurance', 'employee', 'injury'] },
    { q: 'How do I write a will?', keywords: ['will', 'testament', 'executor', 'beneficiaries'] },
    { q: 'What are my rights as a tenant?', keywords: ['tenant rights', 'landlord', 'lease', 'eviction'] },
    { q: 'How do I register a copyright?', keywords: ['copyright', 'registration', 'protection', 'works'] },
    { q: 'What is small claims court?', keywords: ['small claims', 'court', 'limit', 'process'] },
    { q: 'How do I collect on a judgment?', keywords: ['judgment', 'collection', 'garnishment', 'lien'] },
    { q: 'What is the statute of limitations?', keywords: ['statute of limitations', 'time limit', 'lawsuit'] },
    { q: 'How do I report workplace discrimination?', keywords: ['discrimination', 'eeoc', 'complaint', 'workplace'] },
    { q: 'What are the elements of negligence?', keywords: ['negligence', 'duty', 'breach', 'damages', 'causation'] },
    { q: 'How do I get a restraining order?', keywords: ['restraining order', 'protection order', 'harassment'] },
    { q: 'What is mediation vs arbitration?', keywords: ['mediation', 'arbitration', 'dispute resolution', 'difference'] },
    { q: 'How do I expunge my criminal record?', keywords: ['expungement', 'record', 'seal', 'clean slate'] },
    { q: 'What are my Miranda rights?', keywords: ['miranda', 'rights', 'remain silent', 'attorney'] },
    { q: 'How do I file for bankruptcy?', keywords: ['bankruptcy', 'chapter 7', 'chapter 13', 'process'] },
    { q: 'What is power of attorney?', keywords: ['power of attorney', 'poa', 'agent', 'authority'] },
    { q: 'How do I legally change my name?', keywords: ['name change', 'legal', 'petition', 'court'] },
    { q: 'What is eminent domain?', keywords: ['eminent domain', 'government', 'property', 'compensation'] },
    { q: 'How do I sue for breach of contract?', keywords: ['breach of contract', 'lawsuit', 'damages', 'remedy'] },
  ],

  grants: [
    { q: 'What grants are available for veterans starting a business?', keywords: ['veterans', 'grants', 'business', 'funding'] },
    { q: 'How do I write a grant proposal?', keywords: ['grant proposal', 'application', 'writing', 'tips'] },
    { q: 'What is SBIR funding?', keywords: ['sbir', 'small business', 'innovation', 'research'] },
    { q: 'How do I find grants for my nonprofit?', keywords: ['nonprofit', 'grants', 'foundation', 'search'] },
    { q: 'What is the difference between grants and loans?', keywords: ['grants', 'loans', 'difference', 'repayment'] },
    { q: 'How long does it take to get grant funding?', keywords: ['timeline', 'process', 'approval', 'funding'] },
    { q: 'What are matching grants?', keywords: ['matching', 'grants', 'requirements', 'ratio'] },
    { q: 'How do I register on Grants.gov?', keywords: ['grants.gov', 'registration', 'sam', 'duns'] },
    { q: 'What grants are available for women-owned businesses?', keywords: ['women', 'business', 'grants', 'funding'] },
    { q: 'How do I track grant application deadlines?', keywords: ['deadlines', 'tracking', 'calendar', 'organization'] },
    { q: 'What is grant compliance?', keywords: ['compliance', 'requirements', 'reporting', 'audit'] },
    { q: 'How do I budget for a grant application?', keywords: ['budget', 'expenses', 'grant', 'planning'] },
    { q: 'What are federal vs foundation grants?', keywords: ['federal', 'foundation', 'grants', 'difference'] },
    { q: 'How do I find grants for agricultural projects?', keywords: ['agriculture', 'usda', 'grants', 'farming'] },
    { q: 'What documentation do I need for grant applications?', keywords: ['documentation', 'requirements', 'application', 'forms'] },
  ],
};

/**
 * GET /api/admin/test-knowledge
 * Run comprehensive knowledge tests
 */
export async function GET() {
  try {
    const results: any = {
      total: 0,
      correct: 0,
      byCategory: {},
    };

    // Test each category
    for (const [category, questions] of Object.entries(TEST_QUESTIONS)) {
      const categoryResults = {
        total: questions.length,
        correct: 0,
        questions: [],
      };

      // Test each question
      for (const test of questions) {
        const isCorrect = await testQuestion(test.q, test.keywords);
        if (isCorrect) {
          categoryResults.correct++;
          results.correct++;
        }
        results.total++;

        categoryResults.questions.push({
          question: test.q,
          correct: isCorrect,
        });
      }

      categoryResults.score = Math.round((categoryResults.correct / categoryResults.total) * 100);
      results.byCategory[category] = categoryResults;
    }

    results.overallScore = Math.round((results.correct / results.total) * 100);

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Test Knowledge] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Test a single question
 */
async function testQuestion(question: string, keywords: string[]): Promise<boolean> {
  try {
    // Search knowledge base
    const { data, error } = await supabase
      .rpc('search_documentation', {
        query_text: question,
        match_count: 5,
      });

    if (error || !data || data.length === 0) {
      return false;
    }

    // Check if top results contain expected keywords
    const topResults = data.slice(0, 3);
    const combinedContent = topResults
      .map((r: any) => `${r.title} ${r.content}`)
      .join(' ')
      .toLowerCase();

    // Question passes if at least 50% of keywords are found
    const foundKeywords = keywords.filter(keyword => 
      combinedContent.includes(keyword.toLowerCase())
    );

    return foundKeywords.length >= Math.ceil(keywords.length * 0.5);

  } catch (error) {
    console.error(`Failed to test question: ${question}`, error);
    return false;
  }
}
