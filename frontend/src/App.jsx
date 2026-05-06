import { useState } from 'react'
import Header from './components/Header.jsx'
import UploadPage from './pages/UploadPage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import EDGARPage from './pages/EDGARPage.jsx'

export default function App() {
  const [page, setPage] = useState('upload')   // 'upload' | 'result' | 'edgar'
  const [report, setReport] = useState(null)

  const handleReportReady = (r) => {
    setReport(r)
    setPage('result')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 24px 60px' }}>
        {page === 'upload' && <UploadPage onReportReady={handleReportReady} />}
        {page === 'result' && report && <ResultPage report={report} onBack={() => setPage('upload')} />}
        {page === 'edgar'  && <EDGARPage onReportReady={handleReportReady} />}
      </main>
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 24px',
        textAlign: 'center',
        color: 'var(--text-light)',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        background: 'var(--card)'
      }}>
        · Generative AI Capstone 2026 · Use Case 3 / 5
      </footer>
    </div>
  )
}
