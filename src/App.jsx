import { useState, useRef } from 'react'
import './App.css'
import { analyzeResume } from './analyzeResume'

/* Feedback ke liye: har check ka status aur salah */
const ADVICE = {
  'Keyword match': {
    good: 'Your resume covers most of the important keywords.',
    fix: 'Add the missing keywords where they honestly apply. Paste a job description for a role-specific match.',
  },
  'Sections and structure': {
    good: 'Standard section headings are present, so an ATS can parse your resume.',
    fix: 'Use clear headings like Summary, Education, Skills, Projects and Experience.',
  },
  'Formatting and readability': {
    good: 'Your resume length looks right.',
    fix: 'Keep your resume between about 300 and 800 words, ideally one page.',
  },
  'Contact details': {
    good: 'Email, phone and profile links are easy to find.',
    fix: 'Add your email, phone number and a LinkedIn or GitHub link at the top.',
  },
  'Action verbs and impact': {
    good: 'Your bullets show action and results.',
    fix: 'Start bullets with verbs like Built or Led, and add numbers such as "improved speed by 30%".',
  },
}

const getStatus = (v) =>
  v >= 80 ? { text: 'Good', cls: 'good' }
  : v >= 50 ? { text: 'Needs work', cls: 'warn' }
  : { text: 'Weak', cls: 'bad' }

function App() {
  const [signedUp, setSignedUp] = useState(false)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jd, setJd] = useState('')
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSignedUp(true)
    window.scrollTo(0, 0)
  }

  const pickFile = (f) => {
    if (!f) return
    const okType = /\.(pdf|docx)$/i.test(f.name)
    if (!okType) return setError('Sirf PDF ya DOCX file upload karo.')
    if (f.size > 5 * 1024 * 1024) return setError('File 5 MB se chhoti honi chahiye.')
    setError('')
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files[0])
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await analyzeResume(file, jd)
      setResult(res)
      setTimeout(() => {
        document.getElementById('score').scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } catch (err) {
      setResult(null)
      setError(err.message || 'Resume analyze nahi ho paya.')
    } finally {
      setLoading(false)
    }
  }

  /* ---------- PAGE 1: SIGN-UP (navbar nahi) ---------- */
  if (!signedUp) {
    return (
      <div className='auth-page'>
        <p className='title'> &#x1F5CE; 𝚁𝚎𝚜𝚌𝚘</p>

        <p className='t1'>ATS RESUME CHECKER</p>

        <p className='t2'>Know your <span className='ats'>ATS score </span>
        <br />before the recruiter <br />does.</p>

        <p className='t3'>Upload your resume, see how applicant tracking systems read it,
         <br />and fix what is holding it back.</p>

        <div className="card1">
          <div className="circle"> 82 </div>
          <p className='t4'>Sample Result </p>
          <p className='t5'>Strong <br /> Match </p>
        </div>

        <div className="register">
          <div className="sign-logo">Sign-up</div>
          <p className="welcome">Welcome to Resco</p>
          <p className="tagline">Sign up to check your resume's ATS score.</p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" required />
            <input type="email" name="email" placeholder="Email ID" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit" className="signup-btn">Get Started</button>
          </form>
        </div>
      </div>
    )
  }

  /* ---------- PAGE 2+: NAVBAR + SECTIONS ---------- */
  return (
    <div className="site">
      <nav className="navbar">
        <div className="nav-logo">&#x1F5CE; 𝚁𝚎𝚜𝚌𝚘</div>
        <ul className="nav-links">
          <li><a href="#upload">Upload</a></li>
          <li><a href="#score">Score</a></li>
          <li><a href="#feedback">Feedback</a></li>
          <li><a href="#templates">Templates</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>

      {/* ---------- UPLOAD ---------- */}
      <section id="upload" className="section">
        <p className="step-label">STEP 1</p>
        <h1 className="section-title">Upload your <span>resume</span></h1>
        <p className="section-sub">
          We read it the way an applicant tracking system does, then show you
          your score and what is missing.
        </p>

        <div className="upload-layout">
          {/* LEFT */}
          <div className="upload-left">
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4" />
                  <path d="M7 9l5-5 5 5" />
                  <path d="M4 20h16" />
                </svg>
              </div>
              <h3>Drag and drop your resume here</h3>
              <p>PDF or DOCX, up to 5 MB</p>
              <button type="button" className="browse-btn"
                      onClick={() => fileInputRef.current.click()}>
                Browse files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                hidden
                onChange={(e) => pickFile(e.target.files[0])}
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            {file && (
              <div className="file-row">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-status">Ready to analyze</span>
                </div>
                <div className="progress"><div className="progress-fill" /></div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => { setFile(null); setResult(null) }}
                >
                  Remove
                </button>
              </div>
            )}

            <div className="jd-box">
              <p className="jd-title">Job description <span>(optional)</span></p>
              <p className="jd-sub">
                Paste the job posting to see exactly which keywords your resume is missing.
              </p>
              <textarea
                placeholder="Paste the job description here"
                rows="6"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="analyze-btn"
              disabled={!file || loading}
              onClick={handleAnalyze}
            >
              {loading ? 'Analyzing...' : <>Analyze my resume &rarr;</>}
            </button>
          </div>

          {/* RIGHT */}
          <div className="upload-right">
            <div className="check-card">
              <h3>What we check</h3>
              <ul>
                <li><b>Keyword match</b><span>Skills and terms recruiters search for.</span></li>
                <li><b>Sections and structure</b><span>Standard headings an ATS can parse.</span></li>
                <li><b>Formatting and readability</b><span>Layout, fonts and length that parse cleanly.</span></li>
                <li><b>Contact details</b><span>Email, phone and links are easy to find.</span></li>
                <li><b>Action verbs and impact</b><span>Bullets that show results, not just duties.</span></li>
              </ul>
            </div>

            <div className="tip-card">
              <b>Tip:</b> Use a one-column resume saved as PDF or DOCX. Tables and
              text boxes often confuse ATS parsers.
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SCORE ---------- */}
      <section id="score" className="section">
        <p className="step-label">STEP 2</p>
        <h1 className="section-title">Your ATS <span>score</span></h1>

        {!result ? (
          <p className="section-sub">
            Upload your resume above and click "Analyze my resume" to see your score here.
          </p>
        ) : (
          <>
            <p className="section-sub">
              Here is how an applicant tracking system would read your resume.
            </p>

            <div className="score-layout">
              {/* LEFT: big score */}
              <div className="score-main">
                <div className="score-circle" style={{ '--score': result.score }}>
                  <span>{result.score}</span>
                </div>
                <p className="score-label">{result.label}</p>
                <p className="score-note">out of 100</p>
              </div>

              {/* RIGHT: breakdown */}
              <div className="score-breakdown">
                <h3>Score breakdown</h3>
                {result.breakdown.map((item) => (
                  <div className="bar-row" key={item.name}>
                    <div className="bar-top">
                      <span>{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="score-extra">
              <div className="missing-card">
                <h3>Missing keywords</h3>
                <div className="chips">
                  {result.missing.map((word) => (
                    <span className="chip" key={word}>{word}</span>
                  ))}
                </div>
              </div>

              <div className="tips-card">
                <h3>Quick wins</h3>
                <ul>
                  {result.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ---------- BAAKI SECTIONS (baad me bharenge) ---------- */}
      <section id="feedback" className="section">
        <p className="step-label">STEP 3</p>
        <h1 className="section-title">Improvement <span>feedback</span></h1>

        {!result ? (
          <p className="section-sub">
            Analyze your resume first. Your personalised feedback will show up here.
          </p>
        ) : (
          <>
            <p className="section-sub">
              Fix the weakest areas first. Small changes here move your score the most.
            </p>

            <div className="priority-card">
              <h3>Fix these first</h3>
              {[...result.breakdown]
                .sort((x, y) => x.value - y.value)
                .filter((item) => item.value < 80)
                .slice(0, 2)
                .map((item) => (
                  <div className="priority-item" key={item.name}>
                    <b>{item.name} ({item.value}%)</b>
                    <span>{ADVICE[item.name].fix}</span>
                  </div>
                ))}
              {result.breakdown.every((item) => item.value >= 80) && (
                <p className="priority-ok">Nothing urgent. Your resume looks solid.</p>
              )}
            </div>

            <div className="feedback-grid">
              {result.breakdown.map((item) => {
                const status = getStatus(item.value)
                return (
                  <div className="feedback-card" key={item.name}>
                    <div className="feedback-top">
                      <h3>{item.name}</h3>
                      <span className={`badge ${status.cls}`}>{status.text}</span>
                    </div>
                    <div className="bar-track">
                      <div className={`bar-fill ${status.cls}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <p className="feedback-text">
                      {item.value >= 80 ? ADVICE[item.name].good : ADVICE[item.name].fix}
                    </p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
      <section id="templates" className="section"><h1 className="section-title">Templates</h1></section>
      <section id="about" className="section"><h1 className="section-title">About</h1></section>
    </div>
  )
}

export default App