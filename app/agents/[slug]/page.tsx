import { notFound } from 'next/navigation';
import CaseStudyList from '@/app/components/CaseStudyList';
import BackButton from '@/app/components/BackButton';
import ScoutEasel from '@/app/components/ScoutEasel';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const agentInfo: Record<string, { name: string; color: string; description: string; status: 'live' | 'demo' }> = {
  'scout': {
    name: 'Scout',
    color: '#669BBC',
    description: 'Fraud Trends Investigator',
    status: 'demo'
  },
  'ticker': {
    name: 'Ticker',
    color: '#22c55e',
    description: 'Stock Portfolio Monitor',
    status: 'demo'
  },
  'matcher': {
    name: 'Matcher',
    color: '#f97316',
    description: 'House Finder with School Ratings',
    status: 'demo'
  },
  'quill': {
    name: 'Quill',
    color: '#8b5cf6',
    description: 'Article Editor & SEO Optimizer',
    status: 'demo'
  },
  'sage': {
    name: 'Sage',
    color: '#C1121F',
    description: 'Bhagavad Gita Spiritual Guide',
    status: 'live'
  }
};

// Map friendly slugs to database agent_slug
const slugMapping: Record<string, string> = {
  'scout': 'fraud-trends',
  'ticker': 'stock-monitor',
  'matcher': 'house-finder',
  'quill': 'article-editor',
  'sage': 'gita-guide'
};

export default async function AgentPage({ params }: PageProps) {
  const { slug } = await params;

  const agent = agentInfo[slug];
  if (!agent) {
    notFound();
  }

  const dbSlug = slugMapping[slug];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Floating Embers Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="ember"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-10%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <BackButton />

          <div className="glass-panel p-12">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-6xl font-bold" style={{ color: agent.color }}>
                {agent.name}
              </h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                agent.status === 'live'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                {agent.status === 'live' ? 'LIVE CHAT' : 'PRE-RUN DEMOS'}
              </span>
            </div>
            <p className="text-2xl" style={{ color: '#FDF0D5' }}>
              {agent.description}
            </p>
          </div>
        </div>

        {/* Scout Workflow Animation - Only for Scout agent */}
        {slug === 'scout' && (
          <div className="mb-12">
            <ScoutEasel />
          </div>
        )}

        {/* Case Studies */}
        <CaseStudyList agentSlug={dbSlug} agentName={agent.name} agentColor={agent.color} />
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return Object.keys(agentInfo).map((slug) => ({
    slug,
  }));
}
