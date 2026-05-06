import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'
const FORM_TYPES = ['10-K', '10-Q', '8-K', 'S-1', 'DEF 14A']
const EXAMPLE_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'JPM', 'GS', 'BAC']
const FORM_HINTS = {
  '10-K':    'Annual report — full financials & risk factors',
  '10-Q':    'Quarterly update & financial statements',
  '8-K':     'Material events: mergers, earnings, leadership',
  'S-1':     'IPO registration statement',
  'DEF 14A': 'Proxy statement for shareholder votes',
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=JetBrains+Mono:wght@400;500;600&family=Epilogue:wght@400;500;600&display=swap');

@keyframes fadeUp { from { opacity:0; transform:translateY(26px) } to { opacity:1; transform:none } }
@keyframes spin   { to { transform:rotate(360deg) } }
@keyframes rowIn  { from { opacity:0; transform:translateX(-10px) } to { opacity:1; transform:none } }

.e0 { animation:fadeUp .5s cubic-bezier(.22,.68,0,1.2) both }
.e1 { animation:fadeUp .5s .1s cubic-bezier(.22,.68,0,1.2) both; opacity:0 }
.e2 { animation:fadeUp .5s .2s cubic-bezier(.22,.68,0,1.2) both; opacity:0 }

.ticker-input {
  width:100%; padding:14px 16px; box-sizing:border-box;
  background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08);
  border-radius:9px; outline:none;
  font-family:'JetBrains Mono',monospace; font-size:18px; font-weight:600;
  color:#F0EBE0; letter-spacing:.06em;
  transition:border-color .2s, box-shadow .2s;
}
.ticker-input:focus { border-color:rgba(255,182,0,.5); box-shadow:0 0 0 3px rgba(255,182,0,.1) }
.ticker-input::placeholder { color:rgba(240,235,224,.18); font-size:14px; letter-spacing:0 }

.form-select {
  width:100%; padding:14px 14px; box-sizing:border-box;
  background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08);
  border-radius:9px; outline:none;
  font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:500;
  color:#F0EBE0; cursor:pointer; letter-spacing:.04em;
  transition:border-color .2s;
}
.form-select:focus { border-color:rgba(255,182,0,.4) }
.form-select option { background:#1c1c1c }

.search-btn {
  font-family:'Epilogue',sans-serif; font-size:13px; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; padding:14px 28px; border-radius:9px; border:none;
  cursor:pointer; display:flex; align-items:center; gap:8px; white-space:nowrap;
  background:linear-gradient(135deg,#FFB600,#DD8E00); color:#1a0e00;
  box-shadow:0 5px 20px rgba(255,182,0,.28); transition:all .2s;
}
.search-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(255,182,0,.42) }
.search-btn:disabled { background:rgba(255,255,255,.06); color:rgba(240,235,224,.22); cursor:not-allowed; box-shadow:none }

.chip {
  font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; letter-spacing:.04em;
  padding:5px 14px; border-radius:100px; cursor:pointer;
  background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
  color:rgba(240,235,224,.4); transition:all .15s;
}
.chip:hover { background:rgba(255,182,0,.1); border-color:rgba(255,182,0,.28); color:#FFB600 }

.row {
  background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06);
  border-radius:11px; padding:18px 22px;
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  transition:all .2s; animation:rowIn .3s ease both;
}
.row:hover { background:rgba(255,255,255,.045); border-color:rgba(255,182,0,.14); transform:translateX(4px) }

.edgar-link {
  font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:500; letter-spacing:.05em;
  padding:8px 16px; border-radius:7px; text-decoration:none; white-space:nowrap;
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); color:rgba(240,235,224,.55);
  transition:all .2s;
}
.edgar-link:hover { background:rgba(255,182,0,.1); border-color:rgba(255,182,0,.28); color:#FFB600 }

.info-tile {
  background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06);
  border-radius:9px; padding:14px;
  transition:all .2s;
}
.info-tile:hover { border-color:rgba(255,182,0,.14); background:rgba(255,255,255,.035) }
`

export default function EDGARPage() {
  const [ticker,   setTicker]   = useState('')
  const [formType, setFormType] = useState('10-K')
  const [loading,  setLoading]  = useState(false)
  const [filings,  setFilings]  = useState(null)
  const [error,    setError]    = useState('')

  const search = async () => {
    if (!ticker.trim()) return
    setLoading(true); setError(''); setFilings(null)
    try {
      const { data } = await axios.post(`${API}/edgar/search`, {
        ticker: ticker.toUpperCase().trim(), form_type: formType, limit: 5,
      })
      setFilings(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'No filings found. Try a different ticker or form type.')
    } finally { setLoading(false) }
  }

  const FieldLabel = ({ children }) => (
    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:600, color:'rgba(240,235,224,.28)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:8 }}>
      {children}
    </div>
  )

  return (
    <>
      <style>{CSS}</style>
      <div style={{ paddingTop:56, maxWidth:800, margin:'0 auto', fontFamily:"'Epilogue',sans-serif" }}>

        {/* HEADER */}
        <div className="e0" style={{ marginBottom:44 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(100,160,255,.07)', border:'1px solid rgba(100,160,255,.18)',
            borderRadius:100, padding:'6px 16px', marginBottom:18,
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#6AA0FF' }} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#6AA0FF', letterSpacing:'.1em', textTransform:'uppercase' }}>Free · No API Key Required · EDGAR Live</span>
          </div>

          <h2 style={{
            fontFamily:"'Fraunces',serif", fontWeight:900,
            fontSize:'clamp(30px,4.5vw,50px)', color:'#F0EBE0',
            letterSpacing:'-1.5px', lineHeight:1.05, marginBottom:14,
          }}>
            SEC EDGAR<br />
            <em style={{ fontWeight:300, color:'rgba(240,235,224,.45)' }}>Filing </em>
            <span style={{ color:'#6AA0FF' }}>Search</span>
          </h2>

          <p style={{ color:'rgba(240,235,224,.36)', fontSize:16, lineHeight:1.75, maxWidth:520 }}>
            Search millions of real SEC filings — 10-K, 10-Q, 8-K, S-1 — directly from the
            SEC's public EDGAR database. No authentication needed.
          </p>
        </div>

        {/* SEARCH CARD */}
        <div className="e1" style={{
          background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.07)',
          borderRadius:16, padding:'28px 28px 22px', marginBottom:28,
          boxShadow:'0 20px 52px rgba(0,0,0,.4)',
        }}>
          <div style={{ display:'flex', gap:14, marginBottom:18, flexWrap:'wrap' }}>
            {/* Ticker */}
            <div style={{ flex:1, minWidth:150 }}>
              <FieldLabel>Ticker Symbol</FieldLabel>
              <input
                className="ticker-input"
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. AAPL"
              />
            </div>
            {/* Form type */}
            <div style={{ minWidth:145 }}>
              <FieldLabel>Form Type</FieldLabel>
              <select className="form-select" value={formType} onChange={e => setFormType(e.target.value)}>
                {FORM_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            {/* Button */}
            <div style={{ display:'flex', alignItems:'flex-end' }}>
              <button className="search-btn" onClick={search} disabled={loading || !ticker.trim()}>
                {loading ? (
                  <>
                    <span style={{ width:13, height:13, border:'2px solid rgba(0,0,0,.2)', borderTopColor:'rgba(0,0,0,.7)', borderRadius:'50%', animation:'spin .8s linear infinite', display:'inline-block' }} />
                    Searching
                  </>
                ) : 'Search EDGAR'}
              </button>
            </div>
          </div>

          {/* Form hint */}
          <div style={{
            background:'rgba(100,160,255,.05)', border:'1px solid rgba(100,160,255,.1)',
            borderRadius:7, padding:'9px 14px', marginBottom:16,
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:600, letterSpacing:'.06em',
              background:'rgba(100,160,255,.12)', border:'1px solid rgba(100,160,255,.2)',
              borderRadius:5, padding:'2px 10px', color:'#6AA0FF',
            }}>{formType}</span>
            <span style={{ fontSize:13, color:'rgba(240,235,224,.32)' }}>{FORM_HINTS[formType]}</span>
          </div>

          {/* Quick chips */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(240,235,224,.2)', letterSpacing:'.08em', textTransform:'uppercase', marginRight:4 }}>Quick:</span>
            {EXAMPLE_TICKERS.map(t => (
              <button key={t} className="chip" onClick={() => setTicker(t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ padding:'14px 18px', background:'rgba(210,55,30,.07)', border:'1px solid rgba(210,55,30,.2)', borderRadius:10, display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <span>⚠</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'#E05030', lineHeight:1.5 }}>{error}</span>
          </div>
        )}

        {/* RESULTS */}
        {filings && (
          <div style={{ animation:'fadeUp .35s ease both' }}>
            {/* result meta */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
              <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:18, color:'#F0EBE0', letterSpacing:'-0.3px' }}>
                {filings.filings.length} filings
              </span>
              <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,.2)', flexShrink:0 }} />
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'rgba(240,235,224,.3)' }}>
                {filings.ticker} · {filings.form_type}
              </span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filings.filings.map((f, i) => (
                <div key={i} className="row" style={{ animationDelay:`${i * .06}s` }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{
                        fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:600, letterSpacing:'.06em',
                        background:'rgba(100,160,255,.1)', border:'1px solid rgba(100,160,255,.2)',
                        borderRadius:5, padding:'2px 10px', color:'#6AA0FF', flexShrink:0,
                      }}>{f.form_type}</span>
                      <span style={{ fontFamily:"'Epilogue',sans-serif", fontWeight:600, fontSize:14, color:'#F0EBE0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {f.company_name}
                      </span>
                    </div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(240,235,224,.24)', letterSpacing:'.03em' }}>
                      Filed: {f.file_date}
                      {f.accession_no && <span style={{ marginLeft:12, opacity:.7 }}>· {f.accession_no}</span>}
                    </div>
                  </div>
                  {f.accession_no && (
                    <a
                      className="edgar-link"
                      href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${f.accession_no}`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      VIEW ON EDGAR ↗
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)', margin:'24px 0' }} />

            <div style={{ padding:'14px 18px', background:'rgba(26,140,78,.05)', border:'1px solid rgba(26,140,78,.14)', borderRadius:10, display:'flex', alignItems:'flex-start', gap:10 }}>
              <span style={{ fontSize:15 }}>💡</span>
              <span style={{ fontSize:13, color:'rgba(240,235,224,.38)', lineHeight:1.65 }}>
                To analyze a filing, download it as PDF from EDGAR and upload it via the{' '}
                <strong style={{ color:'rgba(240,235,224,.6)', fontWeight:600 }}>Upload Document</strong> tab.
              </span>
            </div>
          </div>
        )}

        {/* INFO BOX — empty state */}
        {!filings && !loading && (
          <div className="e2" style={{
            background:'rgba(255,255,255,.015)', border:'1px solid rgba(255,255,255,.06)',
            borderRadius:16, padding:'28px 28px 24px',
          }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:'#F0EBE0', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
              <span>📚</span> About SEC EDGAR
            </div>
            <p style={{ fontSize:14, color:'rgba(240,235,224,.33)', lineHeight:1.8, margin:'0 0 22px' }}>
              The SEC's EDGAR system is completely free and contains millions of filings from
              all publicly traded companies. No API key or authentication required.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(165px,1fr))', gap:10 }}>
              {[['10-K','Annual report with full financials and risk factors'],
                ['10-Q','Quarterly update and financial statements'],
                ['8-K', 'Material events — mergers, earnings, leadership'],
                ['S-1', 'IPO registration statement']
              ].map(([form, desc]) => (
                <div key={form} className="info-tile">
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:600, fontSize:12, color:'#6AA0FF', marginBottom:6, letterSpacing:'.05em' }}>{form}</div>
                  <div style={{ fontSize:12, color:'rgba(240,235,224,.28)', lineHeight:1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}