import { notFound } from 'next/navigation';
import CaseStudyList from '@/app/components/CaseStudyList';
import AgentHero from '@/app/components/AgentHero';
import Navbar from '@/app/components/Navbar';
import ChatInterface from '@/app/components/ChatInterface';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const agentInfo: Record<string, {
  name: string;
  color: string;
  description: string;
  status: 'live' | 'demo';
  bgClass: string;
  isDark: boolean;
}> = {
  scout: {
    name: 'Scout',
    color: '#003049',
    description: 'Fraud Trends Investigator',
    status: 'demo',
    bgClass: 'bg-scout',
    isDark: true,
  },
  ticker: {
    name: 'Ticker',
    color: '#780000',
    description: 'Stock Portfolio Monitor',
    status: 'demo',
    bgClass: 'bg-ticker',
    isDark: false,
  },
  matcher: {
    name: 'Matcher',
    color: '#669BBC',
    description: 'House Finder with School Ratings',
    status: 'demo',
    bgClass: 'bg-matcher',
    isDark: false,
  },
  quill: {
    name: 'Quill',
    color: '#C1121F',
    description: 'Article Editor & SEO Optimizer',
    status: 'demo',
    bgClass: 'bg-quill',
    isDark: false,
  },
  sage: {
    name: 'Sage',
    color: '#5a3e2b',
    description: 'Bhagavad Gita Spiritual Guide',
    status: 'live',
    bgClass: 'bg-sage',
    isDark: false,
  },
};

const slugMapping: Record<string, string> = {
  scout:   'fraud-trends',
  ticker:  'stock-monitor',
  matcher: 'house-finder',
  quill:   'article-editor',
  sage:    'gita-guide',
};

export default async function AgentPage({ params }: PageProps) {
  const { slug } = await params;
  const agent = agentInfo[slug];
  if (!agent) notFound();

  const dbSlug = slugMapping[slug];

  return (
    <div className={`min-h-screen ${agent.bgClass}`} style={{ color: agent.isDark ? 'white' : 'var(--text-body)' }}>
      {/* Sticky navbar */}
      <Navbar
        agentName={agent.name}
        agentColor={agent.color}
        status={agent.status}
      />

      {/* Page content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* Hero: robot orb + pipeline strip */}
        <AgentHero
          slug={slug}
          agentName={agent.name}
          agentColor={agent.color}
          description={agent.description}
          status={agent.status}
        />

        {/* SAGE: chat first, then example conversations */}
        {slug === 'sage' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <ChatInterface agentColor={agent.color} />
            <CaseStudyList
              agentSlug={dbSlug}
              agentName={agent.name}
              agentColor={agent.color}
              isDark={agent.isDark}
              sectionLabel="Example Conversations"
            />
          </div>
        ) : (
          <CaseStudyList
            agentSlug={dbSlug}
            agentName={agent.name}
            agentColor={agent.color}
            isDark={agent.isDark}
          />
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(agentInfo).map((slug) => ({ slug }));
}
