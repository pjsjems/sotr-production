import Head from 'next/head';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found: SPY ON THE RISE</title>
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#16110C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Source Sans 3', system-ui, sans-serif",
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{ color: '#7A1515', fontSize: '80px', lineHeight: 1, marginBottom: '1rem',
          fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}>
          404
        </div>
        <h1 style={{ color: '#F8F5F0', fontSize: '28px', fontWeight: 700,
          fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '1rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '2rem', maxWidth: '400px' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" style={{
          background: '#7A1515', color: '#fff',
          padding: '12px 28px', borderRadius: '6px',
          textDecoration: 'none', fontSize: '13px',
          fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Return to Home
        </Link>
      </div>
    </>
  );
}
