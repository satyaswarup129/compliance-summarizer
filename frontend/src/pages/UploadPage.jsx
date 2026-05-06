import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

const API = 'http://localhost:8000'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=JetBrains+Mono:wght@400;500;600&family=Epilogue:wght@400;500;600&display=swap');

@keyframes fadeUp { from { opacity:0; transform:translateY(26px) } to { opacity:1; transform:none } }
@keyframes spin   { to { transform:rotate(360deg) } }
@keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes orb    { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.18);opacity:.55} }

.u0 { animation:fadeUp .5s cubic-bezier(.22,.68,0,1.2) both }
.u1 { animation:fadeUp .5s .1s cubic-bezier(.22,.68,0,1.2) both; opacity:0 }
.u2 { animation:fadeUp .5s .22s cubic-bezier(.22,.68,0,1.2) both; opacity:0 }

.drop-zone { position:relative; border-radius:18px; overflow:hidden; cursor:pointer; transition:transform .2s, box-shadow .2s }
.drop-zone:hover { transform:translateY(-3px); box-shadow:0 32px 64px rgba(0,0,0,.55) }
.drop-zone:hover .dz-icon { transform:translateY(-5px) scale(1.08) }
.dz-icon { transition:transform .35s cubic-bezier(.34,1.56,.64,1) }

.pdf-btn {
  font-family:'Epilogue',sans-serif; font-size:13px; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; padding:13px 36px; border-radius:8px; border:none; cursor:pointer;
  background:linear-gradient(135deg,#FFB600,#DD8E00); color:#1a0e00;
  box-shadow:0 6px 22px rgba(255,182,0,.32); transition:all .2s;
}
.pdf-btn:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(255,182,0,.48) }

.fc {
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07);
  border-radius:14px; padding:22px 20px; position:relative; overflow:hidden;
  transition:all .2s;
}
.fc::before {
  content:''; position:absolute; top:0; left:0; right:0; height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,182,0,.3),transparent);
  opacity:0; transition:opacity .2s;
}
.fc:hover { background:rgba(255,255,255,.04); border-color:rgba(255,182,0,.16); transform:translateY(-2px) }
.fc:hover::before { opacity:1 }
`

const FEATURES = [
  { sym:'◈', tag:'RISK DETECTION',   title:'Risk Detection',    desc:'HIGH / MED / LOW severity ratings for every extracted finding' },
  { sym:'◉', tag:'OBLIGATIONS',      title:'Compliance Points', desc:'Every legal obligation, rule reference & deadline captured' },
  { sym:'◆', tag:'ACTION ITEMS',     title:'Action Items',      desc:'Concrete next steps mapped to responsible teams & timelines' },
  { sym:'◇', tag:'EXEC BRIEF',       title:'Executive Summary', desc:'4–5 sentence brief structured for senior management review' },
]

export default function UploadPage({ onReportReady }) {
  const [state,    setState]    = useState('idle')
  const [progress, setProgress] = useState(0)
  const [message,  setMessage]  = useState('')
  const [error,    setError]    = useState('')

  const processJob = useCallback(async (jobId) => {
    return new Promise((resolve, reject) => {
      const iv = setInterval(async () => {
        try {
          const { data } = await axios.get(`${API}/status/${jobId}`)
          setProgress(data.progress); setMessage(data.message)
          if (data.status === 'done')  { clearInterval(iv); resolve(data.result) }
          if (data.status === 'error') { clearInterval(iv); reject(new Error(data.message)) }
        } catch (e) { clearInterval(iv); reject(e) }
      }, 1500)
    })
  }, [])

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0]; if (!file) return
    setError(''); setState('uploading'); setProgress(0); setMessage('Uploading document…')
    try {
      const form = new FormData(); form.append('file', file)
      const { data: job } = await axios.post(`${API}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setState('processing')
      onReportReady(await processJob(job.job_id))
    } catch (e) { setState('error'); setError(e.response?.data?.detail || e.message || 'Something went wrong.') }
  }, [onReportReady, processJob])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
    disabled: state === 'uploading' || state === 'processing',
  })

  const isLoading = state === 'uploading' || state === 'processing'

  /* corner bracket helper */
  const Corner = ({ t, b, l, r }) => (
    <div style={{
      position:'absolute', width:18, height:18,
      top: t != null ? t : 'auto', bottom: b != null ? b : 'auto',
      left: l != null ? l : 'auto', right: r != null ? r : 'auto',
      borderColor:'rgba(255,182,0,.45)', borderStyle:'solid',
      borderWidth: `${t!=null?2:0}px ${r!=null?2:0}px ${b!=null?2:0}px ${l!=null?2:0}px`,
      pointerEvents:'none',
    }} />
  )

  return (
    <>
      <style>{CSS}</style>
      <div style={{ paddingTop:56, fontFamily:"'Epilogue',sans-serif" }}>

        {/* HERO */}
        <div className="u0" style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,182,0,.07)', border:'1px solid rgba(255,182,0,.2)',
            borderRadius:100, padding:'6px 16px', marginBottom:22,
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#FFB600', animation:'blink 1.6s ease infinite' }} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#FFB600', letterSpacing:'.1em', textTransform:'uppercase' }}>
              Capital Markets · Regulatory Intelligence
            </span>
          </div>

          <h1 style={{
            fontFamily:"'Fraunces',serif", fontWeight:900, fontStyle:'normal',
            fontSize:'clamp(36px,5.5vw,62px)', color:'#F0EBE0',
            lineHeight:1.02, letterSpacing:'-2px', marginBottom:20,
          }}>
            AI-Driven<br />
            <em style={{ fontWeight:300, color:'rgba(240,235,224,.45)' }}>Compliance </em>
            <span style={{ color:'#FFB600' }}>Analysis</span>
          </h1>

          <p style={{ fontSize:16, color:'rgba(240,235,224,.38)', maxWidth:500, margin:'0 auto', lineHeight:1.8 }}>
            Upload any SEC filing, prospectus, or compliance manual.
            Our AI extracts obligations, flags risks, and delivers a structured report in minutes.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        <div className="u1" style={{ maxWidth:620, margin:'0 auto 52px' }}>
          {!isLoading ? (
            <div
              {...getRootProps()} className="drop-zone"
              style={{
                border:`1.5px dashed ${isDragActive ? '#FFB600' : 'rgba(255,255,255,.1)'}`,
                padding:'64px 40px 52px', textAlign:'center',
                background: isDragActive ? 'rgba(255,182,0,.05)' : 'rgba(255,255,255,.02)',
                boxShadow: isDragActive
                  ? '0 0 0 4px rgba(255,182,0,.1), 0 24px 60px rgba(0,0,0,.5)'
                  : '0 20px 52px rgba(0,0,0,.42)',
              }}
            >
              <Corner t={10} l={10} /><Corner t={10} r={10} />
              <Corner b={10} l={10} /><Corner b={10} r={10} />
              <input {...getInputProps()} />

              <div className="dz-icon" style={{ marginBottom:22 }}>
                <div style={{
                  width:80, height:80, margin:'0 auto',
                  background:'rgba(255,182,0,.08)', border:'1px solid rgba(255,182,0,.18)',
                  borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center',
                  position:'relative',
                }}>
                  <div style={{
                    position:'absolute', inset:-20,
                    background:'radial-gradient(circle,rgba(255,182,0,.14) 0%,transparent 70%)',
                    borderRadius:'50%', animation:'orb 3s ease-in-out infinite',
                  }} />
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    {isDragActive ? (
                      <path d="M6 28h24M18 8v16M11 15l7-7 7 7" stroke="#FFB600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <>
                        <rect x="7" y="3" width="16" height="22" rx="2.5" stroke="rgba(255,182,0,.55)" strokeWidth="1.6"/>
                        <path d="M23 3l6 6v21a2.5 2.5 0 01-2.5 2.5H7" stroke="rgba(255,182,0,.55)" strokeWidth="1.6" strokeLinecap="round"/>
                        <path d="M23 3v6h6" stroke="rgba(255,182,0,.55)" strokeWidth="1.6" strokeLinejoin="round"/>
                        <path d="M11 20h8M11 24h5" stroke="#FFB600" strokeWidth="1.6" strokeLinecap="round"/>
                      </>
                    )}
                  </svg>
                </div>
              </div>

              <div style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:22, color:'#F0EBE0', marginBottom:8, letterSpacing:'-0.4px' }}>
                {isDragActive ? 'Release to analyze' : 'Drop your PDF here'}
              </div>
              <div style={{ color:'rgba(240,235,224,.32)', fontSize:14, marginBottom:28 }}>
                or click to browse files
              </div>
              <button className="pdf-btn">Select PDF File</button>
              <div style={{ marginTop:24, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <div style={{ height:1, width:36, background:'rgba(255,255,255,.06)' }} />
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(240,235,224,.18)', letterSpacing:'.08em' }}>
                  10-K · 10-Q · 8-K · PROSPECTUS · MANUALS
                </span>
                <div style={{ height:1, width:36, background:'rgba(255,255,255,.06)' }} />
              </div>
            </div>
          ) : (
            <div style={{
              background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.07)',
              borderRadius:18, padding:'56px 40px', textAlign:'center',
              boxShadow:'0 20px 60px rgba(0,0,0,.45)',
            }}>
              {/* dual ring spinner */}
              <div style={{ position:'relative', width:72, height:72, margin:'0 auto 28px' }}>
                <div style={{ position:'absolute', inset:0, border:'2px solid rgba(255,255,255,.05)', borderTopColor:'#FFB600', borderRadius:'50%', animation:'spin .9s linear infinite' }} />
                <div style={{ position:'absolute', inset:10, border:'1.5px solid rgba(255,182,0,.1)', borderBottomColor:'#FFB600', borderRadius:'50%', animation:'spin 1.6s linear infinite reverse' }} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontSize:24, color:'#FFB600' }}>⚖</div>
              </div>
              <div style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:22, color:'#F0EBE0', marginBottom:8, letterSpacing:'-0.4px' }}>
                {state === 'uploading' ? 'Uploading Document' : 'Analyzing Document'}
              </div>
              <div style={{ color:'rgba(240,235,224,.35)', fontSize:14, marginBottom:32 }}>{message}</div>
              <div style={{ maxWidth:360, margin:'0 auto' }}>
                <div style={{ background:'rgba(255,255,255,.05)', borderRadius:100, height:3, overflow:'hidden' }}>
                  <div style={{
                    width:`${progress}%`, height:'100%',
                    background:'linear-gradient(90deg,#DD8E00,#FFB600,#FFD055)',
                    borderRadius:100, transition:'width .6s cubic-bezier(.4,0,.2,1)',
                    boxShadow:'0 0 10px rgba(255,182,0,.5)',
                  }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(240,235,224,.24)', letterSpacing:'.05em' }}>
                  <span>PROCESSING</span><span>{progress}%</span>
                </div>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div style={{ marginTop:14, padding:'14px 20px', background:'rgba(210,55,30,.07)', border:'1px solid rgba(210,55,30,.22)', borderRadius:10, display:'flex', alignItems:'center', gap:10 }}>
              <span>⚠</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'#E05030', lineHeight:1.5 }}>{error}</span>
            </div>
          )}
        </div>

        {/* FEATURE CARDS */}
        <div className="u2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:12, maxWidth:820, margin:'0 auto' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="fc">
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,182,0,.45)', letterSpacing:'.12em', marginBottom:12 }}>{f.tag}</div>
              <div style={{ fontSize:22, color:'#FFB600', marginBottom:10 }}>{f.sym}</div>
              <div style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:'#F0EBE0', marginBottom:6, letterSpacing:'-0.2px' }}>{f.title}</div>
              <div style={{ fontSize:13, color:'rgba(240,235,224,.3)', lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}