import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [signedUp, setSignedUp] = useState(false)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
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
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files[0])
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
                <button type="button" className="remove-btn" onClick={() => setFile(null)}>
                  Remove
                </button>
              </div>
            )}

            <div className="jd-box">
              <p className="jd-title">Job description <span>(optional)</span></p>
              <p className="jd-sub">
                Paste the job posting to see exactly which keywords your resume is missing.
              </p>
              <textarea placeholder="Paste the job description here" rows="6" />
            </div>

            <button
              type="button"
              className="analyze-btn"
              disabled={!file}
              onClick={() => document.getElementById('score').scrollIntoView({ behavior: 'smooth' })}
            >
              Analyze my resume &rarr;
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

      {/* ---------- BAAKI SECTIONS (baad me bharenge) ---------- */}
      <section id="score" className="section"><h1 className="section-title">Your ATS <span>score</span></h1></section>
      <section id="feedback" className="section"><h1 className="section-title">Feedback</h1></section>
      <section id="templates" className="section"><h1 className="section-title">Templates</h1></section>
      <section id="about" className="section"><h1 className="section-title">About</h1></section>
    </div>
  )
}

export default App