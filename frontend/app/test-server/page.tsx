// This is a server component (no 'use client' directive)

export default function TestServerPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Server Component Test Page</h1>
      <p>If you can see this page, Next.js server components are working correctly.</p>
      <p>Generated at: {new Date().toISOString()}</p>
    </div>
  );
} 