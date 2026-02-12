'use client';

export default function BackButton() {
  return (
    <a
      href="/"
      className="inline-block mb-8 px-4 py-2 rounded-lg transition-colors duration-300"
      style={{
        backgroundColor: 'rgba(0, 48, 73, 0.85)',
        color: '#669BBC'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 48, 73, 1)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 48, 73, 0.85)'}
    >
      ← Back to All Agents
    </a>
  );
}
