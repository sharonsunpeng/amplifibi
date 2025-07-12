export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎉 AmplifiBI Test Page</h1>
      <p>If you can see this, the Next.js server is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
        <h2>✅ Success!</h2>
        <p>Your AmplifiBI application is running correctly.</p>
        <ul>
          <li>Next.js server: Working</li>
          <li>TypeScript: Compiled</li>
          <li>React: Rendering</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Homepage
        </a>
      </div>
    </div>
  )
}