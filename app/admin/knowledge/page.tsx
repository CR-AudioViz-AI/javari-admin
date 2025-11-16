'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Priority import configurations
const PRIORITY_IMPORTS = [
  {
    id: 'digital_products',
    name: 'Digital Products',
    sources: [
      { type: 'sitemap', url: 'https://help.shopify.com/sitemap.xml', pages: 400 },
      { type: 'api', url: 'https://stripe.com/docs/api', pages: 800 },
      { type: 'sitemap', url: 'https://support.teachable.com/sitemap.xml', pages: 300 },
      { type: 'api', url: 'https://gumroad.com/api/docs', pages: 500 },
    ],
    total: 2000,
    cost: 4.00,
    category: 'digital_products',
    tags: ['e-commerce', 'courses', 'payments', 'marketing'],
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    sources: [
      { type: 'sitemap', url: 'https://www.hud.gov/sitemap.xml', pages: 2000 },
      { type: 'csv', url: 'https://www.zillow.com/research/data/zillow-home-value-index.csv', pages: 10000 },
      { type: 'sitemap', url: 'https://www.realtor.com/sitemap.xml', pages: 3000 },
    ],
    total: 15000,
    cost: 30.00,
    category: 'real_estate',
    tags: ['housing', 'investing', 'market data', 'loans'],
  },
  {
    id: 'vacation_rentals',
    name: 'Vacation Rentals',
    sources: [
      { type: 'api', url: 'https://www.airbnb.com/api/v2/help', pages: 500 },
      { type: 'sitemap', url: 'https://www.vrbo.com/sitemap.xml', pages: 300 },
      { type: 'csv', url: 'https://www.airdna.co/data/market-data.csv', pages: 8000 },
      { type: 'sitemap', url: 'https://www.hospitable.com/sitemap.xml', pages: 400 },
    ],
    total: 10000,
    cost: 20.00,
    category: 'vacation_rentals',
    tags: ['airbnb', 'vrbo', 'hosting', 'revenue management'],
  },
  {
    id: 'legal',
    name: 'Legal for All',
    sources: [
      { type: 'api', url: 'https://www.law.cornell.edu/wex/api/export', pages: 3000 },
      { type: 'sitemap', url: 'https://www.nolo.com/sitemap.xml', pages: 2000 },
      { type: 'sitemap', url: 'https://www.usa.gov/sitemap.xml', pages: 1000 },
      { type: 'sitemap', url: 'https://www.legalzoom.com/sitemap.xml', pages: 800 },
      { type: 'api', url: 'https://www.justia.com/api/state-laws', pages: 1200 },
    ],
    total: 8000,
    cost: 16.00,
    category: 'legal',
    tags: ['business law', 'contracts', 'compliance', 'forms'],
  },
  {
    id: 'grants',
    name: 'Grants & Free Money',
    sources: [
      { type: 'api', url: 'https://www.grants.gov/grantsws/rest/opportunities/search/', pages: 3000 },
      { type: 'sitemap', url: 'https://www.sba.gov/funding-programs/sitemap.xml', pages: 300 },
      { type: 'sitemap', url: 'https://www.rd.usda.gov/sitemap.xml', pages: 200 },
      { type: 'api', url: 'https://www.grants.gov/web/grants/learn-grants.html', pages: 500 },
    ],
    total: 5000,
    cost: 10.00,
    category: 'grants',
    tags: ['grants', 'funding', 'sba', 'veterans', 'small business'],
  },
];

export default function AdminKnowledgeDashboard() {
  const [activeTab, setActiveTab] = useState('import');
  const [importJobs, setImportJobs] = useState<any[]>([]);
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  // Custom import
  const [customType, setCustomType] = useState('sitemap');
  const [customUrl, setCustomUrl] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    loadKnowledgeStats();
    loadImportJobs();
  }, []);

  const loadKnowledgeStats = async () => {
    try {
      const response = await fetch('/api/admin/knowledge-stats');
      const data = await response.json();
      setKnowledgeStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadImportJobs = async () => {
    try {
      const response = await fetch('/api/admin/bulk-import');
      const data = await response.json();
      if (data.success) {
        setImportJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const startPriorityImport = async (importConfig: any) => {
    try {
      // Start all sources for this category
      for (const source of importConfig.sources) {
        const response = await fetch('/api/admin/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: source.type,
            source: source.url,
            category: importConfig.category,
            tags: importConfig.tags,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to start import for ${source.url}`);
        }
      }

      alert(`Started importing ${importConfig.name}!`);
      loadImportJobs();
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Failed to start import: ${error}`);
    }
  };

  const startCustomImport = async () => {
    if (!customUrl || !customCategory) {
      alert('Please provide URL and category');
      return;
    }

    try {
      const response = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: customType,
          source: customUrl,
          category: customCategory,
          tags: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const data = await response.json();
      alert(`Import started! Job ID: ${data.jobId}`);
      setCustomUrl('');
      setCustomCategory('');
      loadImportJobs();
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Failed to start import: ${error}`);
    }
  };

  const runKnowledgeTests = async () => {
    try {
      const response = await fetch('/api/admin/test-knowledge');
      const data = await response.json();
      setTestResults(data);
      setActiveTab('verify');
    } catch (error) {
      console.error('Test failed:', error);
      alert('Failed to run tests');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Javari Knowledge Management</h1>
          <p className="text-gray-600 mt-2">Rapid knowledge deployment and verification</p>
        </div>

        {/* Stats Overview */}
        {knowledgeStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{knowledgeStats.totalPages?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">With Embeddings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {knowledgeStats.withEmbeddings?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{knowledgeStats.categories || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Test Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {testResults?.overallScore ? `${testResults.overallScore}%` : '--'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bulk Import
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verify'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Verify Knowledge
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Import Jobs
            </button>
          </nav>
        </div>

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* Priority Imports */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Knowledge Imports</CardTitle>
                <CardDescription>
                  One-click bulk imports for critical knowledge domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PRIORITY_IMPORTS.map((config) => (
                    <div key={config.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{config.name}</h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div>📄 {config.total.toLocaleString()} pages</div>
                        <div>💰 ${config.cost.toFixed(2)} cost</div>
                        <div>📁 {config.sources.length} sources</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {config.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => startPriorityImport(config)}
                        className="w-full"
                      >
                        Import Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Import */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Import</CardTitle>
                <CardDescription>Import from any source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Source Type</label>
                    <Select value={customType} onValueChange={setCustomType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">Single URL</SelectItem>
                        <SelectItem value="sitemap">Sitemap (XML)</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                        <SelectItem value="api">API Endpoint (JSON)</SelectItem>
                        <SelectItem value="rss">RSS Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Source URL</label>
                    <Input
                      type="url"
                      placeholder="https://example.com/sitemap.xml"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Input
                      placeholder="e.g., marketing, technology"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  </div>

                  <Button onClick={startCustomImport} className="w-full">
                    Start Custom Import
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Verification</CardTitle>
              <CardDescription>Test Javari's knowledge across all domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!testResults ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">
                      Run comprehensive tests to verify Javari's knowledge
                    </p>
                    <Button onClick={runKnowledgeTests} size="lg">
                      Run All Tests (110 Questions)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-2xl font-bold text-green-900 mb-2">
                        Overall Score: {testResults.overallScore}%
                      </h3>
                      <p className="text-green-700">
                        {testResults.correct} / {testResults.total} questions answered correctly
                      </p>
                    </div>

                    {testResults.byCategory && Object.entries(testResults.byCategory).map(([category, results]: [string, any]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold capitalize">{category.replace('_', ' ')}</h4>
                          <span className="text-lg font-bold">{results.score}%</span>
                        </div>
                        <Progress value={results.score} className="h-2" />
                        <p className="text-sm text-gray-600 mt-2">
                          {results.correct} / {results.total} correct
                        </p>
                      </div>
                    ))}

                    <Button onClick={runKnowledgeTests} variant="outline" className="w-full">
                      Run Tests Again
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <Card>
            <CardHeader>
              <CardTitle>Import Jobs</CardTitle>
              <CardDescription>Monitor active and completed imports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importJobs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No import jobs yet</p>
                ) : (
                  importJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{job.category}</h4>
                          <p className="text-sm text-gray-600">{job.type} import</p>
                        </div>
                        <Badge
                          variant={
                            job.status === 'completed'
                              ? 'success'
                              : job.status === 'failed'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>

                      {job.status === 'processing' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{job.processed} / {job.total}</span>
                          </div>
                          <Progress value={(job.processed / job.total) * 100} />
                        </div>
                      )}

                      {job.status === 'completed' && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Imported {job.processed} pages
                        </p>
                      )}

                      {job.status === 'failed' && (
                        <p className="text-sm text-red-600 mt-2">
                          ✗ {job.error}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
