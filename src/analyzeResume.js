/* ============================================================
   Resco: rule-based resume analyzer (frontend only, no AI)
   1) extractText(file)   
   2) analyzeText(text,jd) 
   ============================================================ */

/* ---------- 1. Extracting Text ---------- */
export async function extractText(file) {
  const buffer = await file.arrayBuffer()
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    const pdfjsLib = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join('') + '\n'
    }
    return text
  }

  // DOCX
  const m = await import('mammoth/mammoth.browser')
  const mammoth = m.default ?? m
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer })
  return value
}

/* ---------- 2. RULES ---------- */
const ACTION_VERBS = new Set([
  'built', 'developed', 'designed', 'created', 'implemented', 'led', 'managed',
  'improved', 'optimized', 'launched', 'delivered', 'reduced', 'increased',
  'achieved', 'analyzed', 'collaborated', 'deployed', 'integrated', 'automated',
  'engineered', 'architected', 'migrated', 'mentored', 'organized', 'coordinated',
  'resolved', 'streamlined', 'tested', 'maintained', 'wrote', 'established',
  'spearheaded', 'initiated', 'produced', 'configured', 'refactored',
  'contributed', 'supported', 'trained', 'presented',
])

const DEFAULT_KEYWORDS = [
  'javascript', 'react', 'html', 'css', 'node', 'git', 'github', 'sql',
  'python', 'java', 'api', 'rest', 'typescript', 'mongodb', 'express',
  'redux', 'tailwind', 'docker', 'testing', 'agile',
]

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'our', 'are', 'will', 'have', 'has',
  'from', 'that', 'this', 'their', 'they', 'who', 'what', 'about', 'able', 'work',
  'working', 'team', 'role', 'job', 'experience', 'years', 'year', 'good', 'strong',
  'skills', 'skill', 'knowledge', 'ability', 'responsible', 'including', 'etc',
  'must', 'should', 'can', 'such', 'other', 'any', 'all', 'new', 'use', 'using',
  'looking', 'candidate', 'company', 'join', 'across', 'within', 'being', 'been',
  'also', 'well', 'more', 'than', 'into', 'over', 'per', 'its', 'not', 'but',
  'preferred', 'required', 'requirements', 'responsibilities', 'qualification',
  'qualifications', 'plus', 'least', 'minimum', 'developer', 'engineer',
  'need', 'needs', 'key', 'want', 'get', 'make', 'may', 'will', 'like', 'etc',
  'ideal', 'excellent', 'proven', 'seeking', 'hiring', 'opportunity',
])

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(?:\+?\d{1,3}[ -]?)?(?:\d{10}|\d{5}[ -]\d{5}|\d{3}[ -]\d{3}[ -]\d{4})\b/
const LINK_RE = /linkedin\.com|github\.com/i

const SECTIONS = [
  { name: 'Education', re: /\beducation\b|\bacademic/i },
  { name: 'Experience', re: /\bexperience\b|\binternship/i },
  { name: 'Skills', re: /\bskills\b/i },
  { name: 'Projects', re: /\bprojects?\b/i },
  { name: 'Summary', re: /\b(summary|objective|profile|about me)\b/i },
]

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)))
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1)

function getJobKeywords(jd) {
  const words = (jd.toLowerCase().match(/[a-z][a-z+#.]{1,}/g) || [])
    .map((w) => w.replace(/\.+$/, ''))
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
  const freq = {}
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1 })
  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 20)
}

export function analyzeText(text, jobDescription = '') {
  const lower = text.toLowerCase()
  const tokens = lower.match(/[a-z]+/g) || []
  const wordCount = (text.match(/\S+/g) || []).length
  const hasJD = jobDescription.trim().length > 20

  /* --- Contact details (15%) --- */
  const hasEmail = EMAIL_RE.test(text)
  const hasPhone = PHONE_RE.test(text)
  const hasLink = LINK_RE.test(text)
  const contact = clamp((hasEmail ? 40 : 0) + (hasPhone ? 40 : 0) + (hasLink ? 20 : 0))

  /* --- Sections (25%) --- */
  const foundSections = SECTIONS.filter((s) => s.re.test(text))
  const missingSections = SECTIONS.filter((s) => !s.re.test(text)).map((s) => s.name)
  const sections = clamp((foundSections.length / SECTIONS.length) * 100)

  /* --- Action verbs + impact (25%) --- */
  const verbCount = tokens.filter((t) => ACTION_VERBS.has(t)).length
  const verbs = clamp((verbCount / 8) * 100)

  const cleaned = text
    .replace(new RegExp(EMAIL_RE.source, 'gi'), ' ')
    .replace(new RegExp(PHONE_RE.source, 'g'), ' ')
    .replace(/\b(19|20)\d{2}\b/g, ' ')
  const numberCount = (cleaned.match(/\d+(\.\d+)?\s?(%|\+|k\b|x\b)|\b\d{2,}\b/gi) || []).length
  const impact = clamp((numberCount / 4) * 100)
  const action = clamp((verbs + impact) / 2)

  /* --- Formatting / length (10%) --- */
  let formatting
  if (wordCount < 150) formatting = 30
  else if (wordCount < 300) formatting = 70
  else if (wordCount <= 800) formatting = 100
  else if (wordCount <= 1000) formatting = 80
  else formatting = 50

  /* --- Keyword match (25%) --- */
  const keywordList = hasJD ? getJobKeywords(jobDescription) : DEFAULT_KEYWORDS
  const matched = keywordList.filter((k) => lower.includes(k))
  const missingKeywords = keywordList.filter((k) => !lower.includes(k))
  const keywords = keywordList.length ? clamp((matched.length / keywordList.length) * 100) : 0

  /* --- Final score (weighted) --- */
  const score = clamp(
    keywords * 0.25 + sections * 0.25 + action * 0.25 + contact * 0.15 + formatting * 0.1
  )

  let label = 'Weak Match'
  if (score >= 80) label = 'Strong Match'
  else if (score >= 60) label = 'Good Match'
  else if (score >= 40) label = 'Needs Work'

  /* --- Tips (sirf jo cheezein kamzor hain) --- */
  const tips = []
  if (contact < 100) {
    const parts = []
    if (!hasEmail) parts.push('email')
    if (!hasPhone) parts.push('phone number')
    if (!hasLink) parts.push('LinkedIn or GitHub link')
    tips.push(`Add your ${parts.join(', ')} so recruiters can reach you.`)
  }
  if (sections < 80) {
    tips.push(`Add standard section headings: ${missingSections.join(', ')}.`)
  }
  if (verbs < 70) {
    tips.push('Start your bullets with action verbs like Built, Designed, Led or Improved.')
  }
  if (impact < 60) {
    tips.push('Add numbers to your bullets, for example "reduced load time by 30%".')
  }
  if (wordCount < 300) {
    tips.push('Your resume looks short. Add more detail about projects and skills.')
  } else if (wordCount > 900) {
    tips.push('Your resume is long. Try to keep it to one or two pages.')
  }
  if (keywords < 70) {
    tips.push(
      hasJD
        ? 'Add the missing keywords where they honestly apply to your experience.'
        : 'Paste a job description to get a role-specific keyword match.'
    )
  }
  if (tips.length === 0) {
    tips.push('Looks solid. Keep tailoring the keywords for each job you apply to.')
  }

  return {
    score,
    label,
    usedJobDescription: hasJD,
    breakdown: [
      { name: 'Keyword match', value: keywords },
      { name: 'Sections and structure', value: sections },
      { name: 'Formatting and readability', value: formatting },
      { name: 'Contact details', value: contact },
      { name: 'Action verbs and impact', value: action },
    ],
    missing: missingKeywords.slice(0, 8).map(cap),
    tips: tips.slice(0, 4),
  }
}

/* ---------- 3. Combine function ---------- */
export async function analyzeResume(file, jobDescription) {
  const text = await extractText(file)
  if (text.replace(/\s/g, '').length < 50) {
    throw new Error('Is file se text nahi nikla. Shayad ye scanned/image wali PDF hai.')
  }
  return analyzeText(text, jobDescription)
}