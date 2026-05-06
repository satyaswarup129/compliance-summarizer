import { useState } from 'react'

const SEV_COLOR  = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' }
const SEV_BG     = { HIGH: 'rgba(239,68,68,0.08)', MEDIUM: 'rgba(245,158,11,0.08)', LOW: 'rgba(16,185,129,0.08)' }
const SEV_BORDER = { HIGH: 'rgba(239,68,68,0.25)', MEDIUM: 'rgba(245,158,11,0.25)', LOW: 'rgba(16,185,129,0.25)' }
const SEV_ICON   = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' }
const SEV_LABEL  = { HIGH: 'HIGH RISK', MEDIUM: 'MEDIUM RISK', LOW: 'LOW RISK' }

const SECTION_CONFIG = [
  {
    key: 'executive_summary',
    title: 'Executive Summary',
    icon: '📊',
    desc: 'Top-level overview for senior management',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    isSummary: true,
  },
  {
    key: 'compliance_points',
    title: 'Key Compliance Points',
    icon: '📋',
    desc: 'Legal obligations and requirements',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
  },
  {
    key: 'risk_areas',
    title: 'Risk Areas',
    icon: '⚠️',
    desc: 'Regulatory exposures and threats',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)',
  },
  {
    key: 'action_items',
    title: 'Recommended Actions',
    icon: '✅',
    desc: 'Concrete next steps for your team',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 100%)',
  },
]

function SeverityBadge({ severity }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: SEV_BG[severity],
      color: SEV_COLOR[severity],
      border: `1px solid ${SEV_BORDER[severity]}`,
      borderRadius: 100, padding: '5px 14px',
      fontSize: 11, fontWeight: 800,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.08em',
    }}>
      {SEV_ICON[severity]} {SEV_LABEL[severity]}
    </span>
  )
}

function StatCard({ value, label, color, icon }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: color,
      }} />
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 40, color, lineHeight: 1, marginBottom: 4, fontWeight: 400,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  )
}

function SummaryCard({ text, gradient }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 20, padding: '32px 36px',
      boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
      border: '1px solid rgba(99,102,241,0.3)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* decorative circle */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '50%',
      }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
      }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>Executive Summary</span>
      </div>
      <p style={{
        color: 'rgba(255,255,255,0.92)',
        fontSize: 16, lineHeight: 1.85,
        fontStyle: 'italic',
        fontFamily: 'var(--font-sans)',
        position: 'relative', zIndex: 1,
      }}>
        "{text}"
      </p>
    </div>
  )
}

function FindingCard({ item, index, color }) {
  return (
    <div style={{
      display: 'flex', gap: 16,
      padding: '20px 24px',
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`
      e.currentTarget.style.transform = 'translateY(-1px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}>
      <div style={{
        minWidth: 28, height: 28,
        background: `${color}18`,
        border: `1.5px solid ${color}40`,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontFamily: 'var(--font-mono)',
        color, fontWeight: 800, flexShrink: 0, marginTop: 2,
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <p style={{
        fontSize: 14, lineHeight: 1.75,
        color: 'var(--text)', margin: 0,
      }}>
        {item}
      </p>
    </div>
  )
}

function Section({ config, items }) {
  const [open, setOpen] = useState(true)
  if (!items || items.length === 0) return null
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    }}>
      {/* Section Header */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 28px',
        background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: open ? '1px solid var(--border)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: config.gradient,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            {config.icon}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
              {config.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              {config.desc}
            </div>
          </div>
          <span style={{
            background: `${config.color}15`,
            color: config.color,
            border: `1px solid ${config.color}30`,
            borderRadius: 100, padding: '2px 12px',
            fontSize: 12, fontWeight: 700,
            fontFamily: 'var(--font-mono)', marginLeft: 4,
          }}>
            {items.length}
          </span>
        </div>
        <span style={{
          color: 'var(--text-light)', fontSize: 12,
          fontFamily: 'var(--font-mono)',
          background: 'var(--surface)',
          padding: '4px 10px', borderRadius: 6,
          border: '1px solid var(--border)',
        }}>
          {open ? '▲ collapse' : '▼ expand'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, i) => (
            <FindingCard key={i} item={item} index={i} color={config.color} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResultPage({ report, onBack }) {
  const [copied, setCopied] = useState(false)
  const stats = report.stats || {}
  const sev = report.overall_severity

  const copyMarkdown = () => {
    navigator.clipboard.writeText(report.markdown || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const downloadMarkdown = () => {
    const blob = new Blob([report.markdown || ''], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.document_name?.replace(/\.pdf$/i, '')}_compliance_report.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ paddingTop: 40 }}>

      {/* ── Top Bar ── */}
      <div className="fade-up" style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 32,
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <button onClick={onBack} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', fontSize: 13,
            color: 'var(--text-muted)', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>← Analyze Another Document</button>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px, 3.5vw, 34px)',
            color: 'var(--ink)', letterSpacing: '-0.5px',
            lineHeight: 1.2, maxWidth: 620,
          }}>
            {report.document_name}
          </h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <SeverityBadge severity={sev} />
            <span style={{
              fontSize: 12, color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              background: 'var(--surface)',
              padding: '4px 12px', borderRadius: 100,
              border: '1px solid var(--border)',
            }}>
              {stats.total_pages} pages · {stats.total_chunks_analyzed} chunks
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={copyMarkdown} style={{
            background: copied ? '#10b981' : 'var(--card)',
            color: copied ? '#fff' : 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 18px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button onClick={downloadMarkdown} style={{
            background: 'var(--ink)', color: '#fff',
            border: 'none', borderRadius: 10,
            padding: '10px 18px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
          }}>
            ⬇ Download .md
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="fade-up-delay-1" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        <StatCard value={stats.compliance_count} label="Compliance Points" color="#3b82f6" icon="📋" />
        <StatCard value={stats.risk_count}        label="Risk Areas"        color="#ef4444" icon="⚠️" />
        <StatCard value={stats.action_count}      label="Action Items"      color="#10b981" icon="✅" />
        <StatCard value={stats.total_pages}        label="Pages Analyzed"   color="#8b5cf6" icon="📄" />
      </div>

      {/* ── Executive Summary ── */}
      <div className="fade-up-delay-2" style={{ marginBottom: 20 }}>
        <SummaryCard
          text={report.executive_summary}
          gradient="linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a5f 100%)"
        />
      </div>

      {/* ── Finding Sections ── */}
      <div className="fade-up-delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SECTION_CONFIG.filter(c => !c.isSummary).map(config => (
          <Section
            key={config.key}
            config={config}
            items={report[config.key]}
          />
        ))}
      </div>

      {/* ── Raw Markdown ── */}
      <details style={{ marginTop: 28 }}>
        <summary style={{
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
          color: 'var(--text-muted)', userSelect: 'none',
          padding: '10px 0', fontFamily: 'var(--font-mono)',
        }}>
          &gt; View raw markdown report
        </summary>
        <pre style={{
          background: '#0d1117', color: 'rgba(255,255,255,0.7)',
          borderRadius: 14, padding: '24px 28px',
          fontSize: 12, fontFamily: 'var(--font-mono)',
          lineHeight: 1.7, overflow: 'auto', marginTop: 8,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          maxHeight: 480, border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {report.markdown}
        </pre>
      </details>
    </div>
  )
}