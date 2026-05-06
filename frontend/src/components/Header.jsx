const NAV = [
  { id: 'upload', label: 'Upload Document' },
  { id: 'edgar',  label: 'SEC EDGAR Search' },
]

export default function Header({ page, setPage }) {
  return (
    <header style={{
      background: 'var(--ink)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>⚖</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 20, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1,
            }}>ComplianceAI</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
              TCS ILP CAPSTONE
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              background: page === n.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: page === n.id ? '#fff' : 'rgba(255,255,255,0.5)',
              border: 'none', cursor: 'pointer',
              padding: '8px 16px', borderRadius: 8,
              fontSize: 14, fontFamily: 'var(--font-sans)',
              fontWeight: page === n.id ? 600 : 400,
              transition: 'all 0.15s ease',
            }}>
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
