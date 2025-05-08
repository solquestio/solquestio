'use client';

export default function TestPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Page Works!</h1>
      <p>If you can see this page, the Next.js routing is working correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
} 