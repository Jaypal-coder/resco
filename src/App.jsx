import { useState, useRef } from "react";
import "./App.css";
import { analyzeResume } from "./analyzeResume";
import { FaReact, FaCss3Alt, FaFilePdf, FaFileWord } from 'react-icons/fa'
import { SiVite } from 'react-icons/si'

/* Feedback ke liye: har check ka status aur salah */
const ADVICE = {
  "Keyword match": {
    good: "Your resume covers most of the important keywords.",
    fix: "Add the missing keywords where they honestly apply. Paste a job description for a role-specific match.",
  },
  "Sections and structure": {
    good: "Standard section headings are present, so an ATS can parse your resume.",
    fix: "Use clear headings like Summary, Education, Skills, Projects and Experience.",
  },
  "Formatting and readability": {
    good: "Your resume length looks right.",
    fix: "Keep your resume between about 300 and 800 words, ideally one page.",
  },
  "Contact details": {
    good: "Email, phone and profile links are easy to find.",
    fix: "Add your email, phone number and a LinkedIn or GitHub link at the top.",
  },
  "Action verbs and impact": {
    good: "Your bullets show action and results.",
    fix: 'Start bullets with verbs like Built or Led, and add numbers such as "improved speed by 30%".',
  },
};

const getStatus = (v) =>
  v >= 80
    ? { text: "Good", cls: "good" }
    : v >= 50
      ? { text: "Needs work", cls: "warn" }
      : { text: "Weak", cls: "bad" };

/* Templates: starting data aur template list */
const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    desc: "Single column, serif headings. Safest choice for any ATS.",
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Clean sans-serif with a teal accent line under each heading.",
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Lots of white space and compact sections. Great for freshers.",
  },
];

const STARTER = {
  name: 'Your Name',
  title: 'Frontend Developer',
  email: 'you@example.com',
  phone: '+91 98765 43210',
  location: 'Vadodara, Gujarat',
  links: 'github.com/yourname | linkedin.com/in/yourname',
  summary: 'Final-year BCA student who builds responsive React interfaces and enjoys turning designs into clean, working products. Looking for a frontend internship to grow with a real team.',
  skills: 'JavaScript, React, HTML, CSS, Git, Node.js, Express, MongoDB, SQL',
  experience: 'Frontend Intern, Company Name (Jun 2026 - Aug 2026)\nBuilt reusable React components used across 5 pages.\nImproved page load time by 30% by optimizing images and code.\nWorked with a team of 4 using Git and weekly code reviews.',
  projects: 'Resco: Built a React app that estimates ATS score from a resume.\nPortfolio Website: Designed a responsive personal site used for internship applications.\nExpense Tracker: Developed a React app with charts and local storage for 100+ entries.',
  education: 'BCA, Your University, 2023 - 2026, CGPA 9.0',
  achievements: 'University Rank 1 in BCA\nWon college hackathon among 40+ teams',
  certifications: 'React Developer Course, Chai aur Code\nResponsive Web Design, freeCodeCamp',
}
const toLines = (text) => text.split('\n').filter((line) => line.trim())
const FIELDS = [
  { key: 'name', label: 'Full name', type: 'input' },
  { key: 'title', label: 'Job title', type: 'input' },
  { key: 'email', label: 'Email', type: 'input' },
  { key: 'phone', label: 'Phone', type: 'input' },
  { key: 'location', label: 'Location', type: 'input' },
  { key: 'links', label: 'Links', type: 'input' },
  { key: 'summary', label: 'Summary', type: 'area' },
  { key: 'skills', label: 'Skills (comma separated)', type: 'input' },
  { key: 'experience', label: 'Experience (first line = role, then one bullet per line)', type: 'area' },
  { key: 'projects', label: 'Projects (one per line)', type: 'area' },
  { key: 'education', label: 'Education', type: 'input' },
  { key: 'achievements', label: 'Achievements (one per line)', type: 'area' },
  { key: 'certifications', label: 'Certifications (one per line)', type: 'area' },
]
const TECH = [
  { name: 'React', icon: <FaReact />, note: 'UI and state' },
  { name: 'Vite', icon: <SiVite />, note: 'Fast dev server and build' },
  { name: 'CSS', icon: <FaCss3Alt />, note: 'Flexbox, Grid, animations' },
  { name: 'pdf.js', icon: <FaFilePdf />, note: 'Reads text from PDF' },
  { name: 'mammoth', icon: <FaFileWord />, note: 'Reads text from DOCX' },
]

function App() {
  const [signedUp, setSignedUp] = useState(false);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jd, setJd] = useState("");
  const [template, setTemplate] = useState("classic");
  const [resume, setResume] = useState(STARTER);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSignedUp(true);
    window.scrollTo(0, 0);
  };

  const pickFile = (f) => {
    if (!f) return;
    const okType = /\.(pdf|docx)$/i.test(f.name);
    if (!okType) return setError("Sirf PDF ya DOCX file upload karo.");
    if (f.size > 5 * 1024 * 1024)
      return setError("File 5 MB se chhoti honi chahiye.");
    setError("");
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await analyzeResume(file, jd);
      setResult(res);
      setTimeout(() => {
        document.getElementById("score").scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err) {
      setResult(null);
      setError(err.message || "Resume analyze nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => setResume({ ...resume, [key]: value });

  /* ---------- PAGE 1: SIGN-UP (navbar nahi) ---------- */
  if (!signedUp) {
    return (
      <div className="auth-page">
        <p className="title"> &#x1F5CE; 𝚁𝚎𝚜𝚌𝚘</p>

        <p className="t1">ATS RESUME CHECKER</p>

        <p className="t2">
          Know your <span className="ats">ATS score </span>
          <br />
          before the recruiter <br />
          does.
        </p>

        <p className="t3">
          Upload your resume, see how applicant tracking systems read it,
          <br />
          and fix what is holding it back.
        </p>

        <div className="card1">
          <div className="circle"> 82 </div>
          <p className="t4">Sample Result </p>
          <p className="t5">
            Strong <br /> Match{" "}
          </p>
        </div>

        <div className="register">
          <div className="sign-logo">Sign-up</div>
          <p className="welcome">Welcome to Resco</p>
          <p className="tagline">Sign up to check your resume's ATS score.</p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <input type="email" name="email" placeholder="Email ID" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit" className="signup-btn">
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ---------- PAGE 2+: NAVBAR + SECTIONS ---------- */
  return (
    <div className="site">
      <nav className="navbar">
        <div className="nav-logo">&#x1F5CE; 𝚁𝚎𝚜𝚌𝚘</div>
        <ul className="nav-links">
          <li>
            <a href="#upload">Upload</a>
          </li>
          <li>
            <a href="#score">Score</a>
          </li>
          <li>
            <a href="#feedback">Feedback</a>
          </li>
          <li>
            <a href="#templates">Templates</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
        </ul>
      </nav>

      {/* ---------- UPLOAD ---------- */}
      <section id="upload" className="section">
        <p className="step-label">STEP 1</p>
        <h1 className="section-title">
          Upload your <span>resume</span>
        </h1>
        <p className="section-sub">
          We read it the way an applicant tracking system does, then show you
          your score and what is missing.
        </p>

        <div className="upload-layout">
          {/* LEFT */}
          <div className="upload-left">
            <div
              className={`drop-zone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 16V4" />
                  <path d="M7 9l5-5 5 5" />
                  <path d="M4 20h16" />
                </svg>
              </div>
              <h3>Drag and drop your resume here</h3>
              <p>PDF or DOCX, up to 5 MB</p>
              <button
                type="button"
                className="browse-btn"
                onClick={() => fileInputRef.current.click()}
              >
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
                <div className="progress">
                  <div className="progress-fill" />
                </div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            <div className="jd-box">
              <p className="jd-title">
                Job description <span>(optional)</span>
              </p>
              <p className="jd-sub">
                Paste the job posting to see exactly which keywords your resume
                is missing.
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
              {loading ? "Analyzing..." : <>Analyze my resume &rarr;</>}
            </button>
          </div>

          {/* RIGHT */}
          <div className="upload-right">
            <div className="check-card">
              <h3>What we check</h3>
              <ul>
                <li>
                  <b>Keyword match</b>
                  <span>Skills and terms recruiters search for.</span>
                </li>
                <li>
                  <b>Sections and structure</b>
                  <span>Standard headings an ATS can parse.</span>
                </li>
                <li>
                  <b>Formatting and readability</b>
                  <span>Layout, fonts and length that parse cleanly.</span>
                </li>
                <li>
                  <b>Contact details</b>
                  <span>Email, phone and links are easy to find.</span>
                </li>
                <li>
                  <b>Action verbs and impact</b>
                  <span>Bullets that show results, not just duties.</span>
                </li>
              </ul>
            </div>

            <div className="tip-card">
              <b>Tip:</b> Use a one-column resume saved as PDF or DOCX. Tables
              and text boxes often confuse ATS parsers.
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SCORE ---------- */}
      <section id="score" className="section">
        <p className="step-label">STEP 2</p>
        <h1 className="section-title">
          Your ATS <span>score</span>
        </h1>

        {!result ? (
          <p className="section-sub">
            Upload your resume above and click "Analyze my resume" to see your
            score here.
          </p>
        ) : (
          <>
            <p className="section-sub">
              Here is how an applicant tracking system would read your resume.
            </p>

            <div className="score-layout">
              {/* LEFT: big score */}
              <div className="score-main">
                <div
                  className="score-circle"
                  style={{ "--score": result.score }}
                >
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
                      <div
                        className="bar-fill"
                        style={{ width: `${item.value}%` }}
                      />
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
                    <span className="chip" key={word}>
                      {word}
                    </span>
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
        <h1 className="section-title">
          Improvement <span>feedback</span>
        </h1>

        {!result ? (
          <p className="section-sub">
            Analyze your resume first. Your personalised feedback will show up
            here.
          </p>
        ) : (
          <>
            <p className="section-sub">
              Fix the weakest areas first. Small changes here move your score
              the most.
            </p>

            <div className="priority-card">
              <h3>Fix these first</h3>
              {[...result.breakdown]
                .sort((x, y) => x.value - y.value)
                .filter((item) => item.value < 80)
                .slice(0, 2)
                .map((item) => (
                  <div className="priority-item" key={item.name}>
                    <b>
                      {item.name} ({item.value}%)
                    </b>
                    <span>{ADVICE[item.name].fix}</span>
                  </div>
                ))}
              {result.breakdown.every((item) => item.value >= 80) && (
                <p className="priority-ok">
                  Nothing urgent. Your resume looks solid.
                </p>
              )}
            </div>

            <div className="feedback-grid">
              {result.breakdown.map((item) => {
                const status = getStatus(item.value);
                return (
                  <div className="feedback-card" key={item.name}>
                    <div className="feedback-top">
                      <h3>{item.name}</h3>
                      <span className={`badge ${status.cls}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${status.cls}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <p className="feedback-text">
                      {item.value >= 80
                        ? ADVICE[item.name].good
                        : ADVICE[item.name].fix}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
      {/* ---------- TEMPLATES ---------- */}
      <section id="templates" className="section">
        
        <p className="step-label">STEP 4</p>
        <h1 className="section-title">
          Resume <span>templates</span>
        </h1>
        <p className="section-sub">
          Pick an ATS-friendly template, edit the details, and download it as a
          PDF.
        </p>

        <div className="template-picker">
          {TEMPLATES.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`template-card ${template === t.id ? "active" : ""}`}
              onClick={() => setTemplate(t.id)}
            >
              <span className="template-name">{t.name}</span>
              <span className="template-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <div className="editor-layout">
          <form className="editor-form" onSubmit={(e) => e.preventDefault()}>
            <h3>Edit your details</h3>
            {FIELDS.map((f) => (
              <label className="field" key={f.key}>
                <span>{f.label}</span>
                {f.type === "area" ? (
                  <textarea
                    rows="4"
                    value={resume[f.key]}
                    onChange={(e) => updateField(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={resume[f.key]}
                    onChange={(e) => updateField(f.key, e.target.value)}
                  />
                )}
              </label>
            ))}
            <div className="editor-actions">
              <button
                type="button"
                className="analyze-btn"
                onClick={() => window.print()}
              >
                Download or Print
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setResume(STARTER)}
              >
                Reset
              </button>
            </div>
            <p className="editor-note">
              In the print window, choose "Save as PDF" as the destination.
            </p>
          </form>

          <div className="preview-wrap">
            <p className="preview-label">Live preview</p>
            <div className={`resume-sheet ${template}`} id="resume-print">
              <h2 className="rs-name">{resume.name}</h2>
<p className="rs-title">{resume.title}</p>
<p className="rs-contact">
  {[resume.email, resume.phone, resume.location, resume.links].filter(Boolean).join('  |  ')}
</p>

<h4 className="rs-heading">Summary</h4>
<p className="rs-text">{resume.summary}</p>

<h4 className="rs-heading">Skills</h4>
<p className="rs-text">{resume.skills}</p>

<h4 className="rs-heading">Experience</h4>
<p className="rs-role">{toLines(resume.experience)[0]}</p>
<ul className="rs-list">
  {toLines(resume.experience).slice(1).map((line, i) => (
    <li key={i}>{line}</li>
  ))}
</ul>

<h4 className="rs-heading">Projects</h4>
<ul className="rs-list">
  {toLines(resume.projects).map((line, i) => (
    <li key={i}>{line}</li>
  ))}
</ul>

<h4 className="rs-heading">Education</h4>
<p className="rs-text">{resume.education}</p>

<h4 className="rs-heading">Achievements</h4>
<ul className="rs-list">
  {toLines(resume.achievements).map((line, i) => (
    <li key={i}>{line}</li>
  ))}
</ul>

<h4 className="rs-heading">Certifications</h4>
<ul className="rs-list">
  {toLines(resume.certifications).map((line, i) => (
    <li key={i}>{line}</li>
  ))}
</ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section id="about" className="section">
        <p className="step-label">STEP 5</p>
        <h1 className="section-title">
          About <span>Resco</span>
        </h1>
        <p className="section-sub">
          Resco helps students and freshers see their resume the way an
          applicant tracking system does, and fix what is holding it back.
        </p>

        <div className="about-grid">
          {[
            {
              n: "01",
              t: "Upload",
              d: "Add your resume as a PDF or DOCX, with an optional job description.",
            },
            {
              n: "02",
              t: "Analyze",
              d: "Resco reads the text in your browser and runs rule-based checks.",
            },
            {
              n: "03",
              t: "Improve",
              d: "See your score, missing keywords and clear fixes, then polish with a template.",
            },
          ].map((s) => (
            <div className="about-card" key={s.n}>
              <span className="about-num">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>

        <div className="about-split">
          <div className="about-box">
            <h1>How the score works</h1>
            <ul className="about-list">
              <li>
                <b>Keyword match (25%)</b> Skills found in your resume.
              </li>
              <li>
                <b>Sections (25%)</b> Standard headings an ATS can parse.
              </li>
              <li>
                <b>Action verbs and impact (25%)</b> Verbs and measurable
                results.
              </li>
              <li>
                <b>Contact details (15%)</b> Email, phone and profile links.
              </li>
              <li>
                <b>Formatting (10%)</b> Resume length and readability.
              </li>
            </ul>
           <h1 className="about-gap">Why Resco</h1>
<ul className="about-list">
  <li><b>Instant results</b> Your score appears in seconds, right in the browser.</li>
  <li><b>Private by design</b> Your resume never leaves your device.</li>
  <li><b>Role-specific</b> Paste a job description to match its keywords.</li>
  <li><b>Fix and download</b> Improve with feedback, then build a clean PDF resume.</li>
</ul>
            <p className="about-note">
              The score is a rule-based estimate. Real ATS software does not
              publish its exact algorithm.
            </p>
          </div>

          <div className="about-box">
            <h3>Privacy</h3>
            <p className="about-text">
              Your resume is read inside your browser. It is not uploaded to any
              server, because Resco has no backend.
            </p>
            <h3 className="about-gap">Built with</h3>
            <br></br>
      <div className="tech-list">
  {TECH.map((tech) => (
    <div className="tech-item" key={tech.name}>
      <span className="tech-icon">{tech.icon}</span>
      <div>
        <b>{tech.name}</b>
        <span>{tech.note}</span>
      </div>
    </div>
  ))}
</div>
          </div>
        </div>

        <div className="author-card">
          <div className="author-avatar">JS</div>
          <div className="author-info">
            <h3>Jaypal Solanki</h3>
            <p>BCA student and aspiring Frontend Developer from Vadodara.</p>
          </div>
          <div className="author-links">
            <a
              href="https://github.com/Jaypal-coder"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/jaypal-solanki-997039327"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
              </svg>
            </a>
          </div>
        </div>

        <footer className="site-footer">
          &copy; 2026 Resco. Built by Jaypal Solanki.
        </footer>
      </section>
    </div>
  );
}

export default App;
