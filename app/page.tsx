import RobotStage from './components/RobotStage';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Floating Embers Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="ember"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${-10}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold mb-6" style={{
            background: 'linear-gradient(to right, #FDF0D5, #669BBC, #FDF0D5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AI Agents Portfolio
          </h1>
          <p className="text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(253, 240, 213, 0.9)' }}>
            Explore 5 distinct AI agents demonstrating different agentic capabilities.
            Built with LangChain, Claude AI, and deployed on Vercel.
          </p>
        </div>

        {/* Agent Showcase */}
        <RobotStage />

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FDF0D5' }}>
              Pre-Run Demonstrations
            </h3>
            <p style={{ color: '#669BBC' }}>
              4 agents showcase complex workflows without API costs in production
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FDF0D5' }}>
              Live Chat Experience
            </h3>
            <p style={{ color: '#669BBC' }}>
              Gita Guide uses a static knowledge base for safe, cost-effective live interaction
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FDF0D5' }}>
              Universal Architecture
            </h3>
            <p style={{ color: '#669BBC' }}>
              All agents share the same database structure for consistency and scalability
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 glass-panel p-12">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#FDF0D5' }}>
            Built With Modern Technologies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-semibold" style={{ color: '#FDF0D5' }}>Claude AI</h4>
              <p className="text-sm" style={{ color: '#669BBC' }}>Anthropic</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔗</div>
              <h4 className="font-semibold" style={{ color: '#FDF0D5' }}>LangChain</h4>
              <p className="text-sm" style={{ color: '#669BBC' }}>Framework</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold" style={{ color: '#FDF0D5' }}>Next.js</h4>
              <p className="text-sm" style={{ color: '#669BBC' }}>Frontend</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🐘</div>
              <h4 className="font-semibold" style={{ color: '#FDF0D5' }}>PostgreSQL</h4>
              <p className="text-sm" style={{ color: '#669BBC' }}>Neon Database</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center">
          <p className="text-sm" style={{ color: 'rgba(253, 240, 213, 0.7)' }}>
            Click on any robot above to explore their capabilities
          </p>
        </div>
      </div>
    </main>
  );
}
