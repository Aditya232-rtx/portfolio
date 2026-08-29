/**
 * Single source of truth for every piece of copy, link and asset on the site.
 * Layout, type and motion live in the CSS/GSAP layer — nothing here affects them.
 */

export const IDENTITY = {
  firstName: 'Aditya',
  lastName: 'Jadhav',
  /** Sticky footer name is split into two halves that slide apart on scroll. */
  stickyNameLeft: 'aditya',
  stickyNameRight: 'jadhav',
  /** Two-line role label beside the preloader logo. */
  role: ['Software', 'Developer'],
  // TODO(aditya): confirm the two hero meta lines.
  location: 'Based in India',
  workingWith: { label: 'Working w/', name: 'Open Source', href: '#' },
  bio: [
    'Builds backend services, agent systems and',
    'data pipelines — with a focus on correctness,',
    'observability and what holds up in production.',
  ],
  copyright: "© '26",
  metaLeft: "'26 © All Right Reserved",
  metaRight: 'made w/ care',
} as const

export const HERO_HEADINGS = {
  name: ['Aditya', 'Jadhav'],
  groups: [
    ['Build', 'Production', 'Systems,'],
    ['Backend', '& Applied', 'AI', 'eng.'],
  ],
  statement: {
    solo: ['ship', 'what'],
    pair: ['survives', 'production.'],
  },
} as const

export const FOOTER_QUOTE = {
  left: [
    ['Everything', 'that exists'],
    ['had first', 'existed as'],
  ],
  right: [
    ['nothing', 'more'],
    ['than a', 'sentence.'],
  ],
} as const

export const CONTACT = {
  availability: ['Available for', 'selected projects'],
  prompt: 'Write directly to:',
  // TODO(aditya): confirm you want this address public on the site.
  email: 'jadhavaditya0723@gmail.com',
  subject: '[Project Inquiry] Hello, Aditya!',
} as const

export type Social = {
  readonly name: string
  readonly href: string
  /** Key into ICONS in components/icons.tsx */
  readonly icon: 'instagram' | 'x' | 'linkedin' | 'github'
}

export const SOCIALS: readonly Social[] = [
  { name: 'GitHub', href: 'https://github.com/Aditya232-rtx', icon: 'github' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/adityajadhav55', icon: 'linkedin' },
  { name: 'X', href: 'https://x.com/jadhavadityaa', icon: 'x' },
  { name: 'Instagram', href: 'https://www.instagram.com/can.adityaa', icon: 'instagram' },
] as const

export const NAV_LINKS = [
  { label: 'Home', href: '/', index: '1' },
  { label: 'Work', href: '/work', index: '2' },
  { label: 'Contact', href: '/contact', index: '3' },
] as const

export const NAV_SECONDARY = { label: 'Experiments', href: '/archive' } as const

export const FEATURED = {
  title: ['Work', '24-26'],
  allWorksLabel: 'All Works',
} as const

/* ------------------------------------------------------------------ *
 * Projects — rendered as the hirotos.com marquee (docs/PROJECTS-PATTERN.md)
 *
 * `shape` drives the 8-step size rhythm: L · P · L · P · WIDE · P · L · P
 * `tags`  are engineering disciplines, slash-separated, NOT a stack dump.
 * `stack` is shown only in the zoom detail panel.
 * ------------------------------------------------------------------ */

export type ProjectShape = 'landscape' | 'portrait' | 'wide'
export type ProjectStatus = 'production' | 'building' | 'archived'
/**
 * `product` — a real thing being built for users.
 * `learning` — built to learn a domain, not to ship commercially.
 * Kept explicit so the work is never oversold.
 */
export type ProjectKind = 'product' | 'learning'

export type Project = {
  readonly id: string
  readonly name: string
  readonly year: string
  readonly status: ProjectStatus
  readonly kind: ProjectKind
  readonly shape: ProjectShape
  /** Discipline labels shown bottom-left on hover. */
  readonly tags: readonly string[]
  /** One line for the marquee hover. */
  readonly blurb: string
  /** Paragraphs for the zoom detail panel. */
  readonly body: readonly string[]
  readonly stack: readonly string[]
  readonly role: string
  /** Poster frame, in /public/projects/ */
  readonly poster: string
  /**
   * Looping demo reel. Muted and autoplayed on hover, so both formats are
   * offered — WebM is markedly smaller where supported.
   */
  readonly video?: { readonly mp4: string; readonly webm?: string }
  readonly href?: string
}

export const PROJECTS: readonly Project[] = [
  {
    id: 'thirddoor',
    name: 'ThirdDoor',
    year: '2026',
    status: 'building',
    kind: 'product',
    shape: 'landscape',
    tags: ['Backend', 'Applied AI', 'SaaS'],
    blurb: 'Getting companies onto the shortlist that AI assistants recommend.',
    body: [
      'Search is moving from ten blue links to a single recommended answer, and most companies are invisible to it. ThirdDoor makes a business legible to AI assistants — semantic structuring and RAG architecture so that when someone asks an LLM for a recommendation, the company is actually in the running.',
      'The front-end is live. I am building the backend now: the crawling and structuring pipeline, the retrieval layer, and the monthly audit that tracks whether a client is actually being surfaced.',
      'This one is a product with users in mind rather than an exercise, which changes the engineering — the pipeline has to keep running unattended and be explainable when a result moves.',
    ],
    stack: ['TypeScript', 'Next.js', 'Python', 'RAG', 'PostgreSQL'],
    role: 'Full-stack — backend in progress',
    poster: '/projects/thirddoor.jpg',
    video: { mp4: '/projects/thirddoor.mp4', webm: '/projects/thirddoor.webm' },
    href: 'https://thirddoor.online',
  },
  {
    id: 'spillthereel',
    name: 'SpillTheReel',
    year: '2026',
    status: 'building',
    kind: 'product',
    shape: 'portrait',
    tags: ['Full-stack', 'Applied AI', 'Mobile'],
    blurb: 'Making the reels you saved actually findable again.',
    // Written from the demo reel — a saved-reels library you can search.
    // TODO(aditya): correct this, it is your product and I only have the video.
    body: [
      'Everyone saves hundreds of reels and finds none of them again. SpillTheReel turns that pile into something searchable — understanding what is actually in a saved video so you can ask for it later in your own words instead of scrolling a grid.',
      'In active development. The interesting problem is retrieval over content nobody wrote text for: the signal has to come from the video itself.',
    ],
    stack: ['TypeScript', 'Next.js', 'Python'],
    role: 'Solo',
    poster: '/projects/spillthereel.jpg',
    video: { mp4: '/projects/spillthereel.mp4' },
  },
  {
    id: 'crowdshield',
    name: 'CrowdShield',
    year: '2026',
    status: 'production',
    kind: 'learning',
    shape: 'landscape',
    tags: ['Computer Vision', 'Backend', 'Public Safety'],
    blurb: 'Real-time crowd safety for temples, stadiums and public gatherings.',
    body: [
      'A situational-awareness platform for large public events and religious gatherings. Live camera feeds are fused through YOLOv8 and YOLO-Crowd for dense-crowd detection, with Mini-Xception reading micro-expressions to flag panic or distress before it becomes a crush.',
      'The dashboard turns that into something an operator can act on: live headcount, a heatmap of the most congested gates, and an alert log. When something goes wrong, Gemini drafts the emergency instruction in English or Marathi and it goes out over SMS and automated voice calls — with a Termux Android bridge as fallback when the venue network is unreliable.',
      'Built for Dagdusheth Temple in Pune as the reference deployment. The engineering lesson was designing for the failure case: the system has to stay useful when a model is slow, a camera drops, or the network is gone.',
    ],
    stack: ['Python', 'Flask', 'OpenCV', 'YOLOv8', 'React', 'Gemini API'],
    role: 'Backend & CV pipeline',
    poster: '/projects/crowdshield.jpg',
    href: 'https://github.com/NMOLE08/CrowdManagement',
  },
  {
    id: 'credexa',
    name: 'Credexa',
    year: '2026',
    status: 'production',
    kind: 'learning',
    shape: 'wide',
    tags: ['Backend', 'Applied AI', 'Fintech'],
    blurb: 'Document verification and risk scoring for loan applications.',
    // Written from the demo reel: a case queue with per-applicant risk scores
    // and tamper detection. TODO(aditya): correct anything I read wrong.
    body: [
      'A document verification system for lending. Applications arrive with supporting documents, and Credexa checks them for tampering before a human opens the file — surfacing a case queue with per-applicant risk scores and a clear cleared / review / flagged state.',
      'The demo runs the same case twice, once with genuine documents and once with forged ones, to show the anomaly detection catching what a manual reviewer would likely miss.',
      'Built to learn the domain rather than to ship commercially, but the parts that taught me most were the production-shaped ones: the ingestion and scoring pipeline, the case state machine, and enough instrumentation to explain after the fact why a document was flagged.',
    ],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'React'],
    role: 'Backend & verification pipeline',
    poster: '/projects/credexa.jpg',
    video: { mp4: '/projects/credexa.mp4', webm: '/projects/credexa.webm' },
  },
  {
    id: 'ouroboros',
    name: 'Ouroboros — Product',
    year: '2026',
    status: 'production',
    kind: 'learning',
    shape: 'landscape',
    tags: ['Backend', 'Agent Systems', 'Security'],
    blurb: 'An autonomous security loop that finds, exploits, fixes and re-verifies.',
    body: [
      'A security platform built around a closed loop: detect a vulnerability, prove it is real by exploiting it, design and test a fix, deploy it, then re-attack to confirm the issue is actually closed.',
      'Built as cooperating agents with a hard governance gate in front of every action — each step is policy-checked before it runs, and every action is written to an immutable audit trail.',
      'A team project, and the one that taught me most about systems allowed to touch production: evidence collection, fail-closed policy enforcement, and staged safety gates between generation, evaluation and validation. I built the front-end and worked on the agent architecture.',
    ],
    stack: ['Python', 'LLM orchestration', 'OPA', 'PostgreSQL', 'Docker'],
    role: 'Front-end & agent architecture (team project)',
    poster: '/projects/ouroboros.jpg',
    video: { mp4: '/projects/ouroboros.mp4' },
  },
  {
    id: 'drishtikosh',
    name: 'Drishtikosh',
    year: '2026',
    status: 'production',
    kind: 'learning',
    shape: 'landscape',
    tags: ['Applied AI', 'Accessibility', 'Full-stack'],
    blurb: 'Turning standard textbooks into something every student can actually use.',
    // Written from the reel: an adaptive learning platform with an AI core,
    // course dashboard and conversational tutor.
    // TODO(aditya): correct anything I read wrong.
    body: [
      'A learning platform for students that standard textbooks fail. The same course material is re-expressed for different needs — visual structure for students with ADHD, audio-first for blind students, captioned visual UI for deaf students — instead of forcing one format on everyone.',
      'Behind it sits an AI core that takes course content and produces those alternative representations, plus a conversational tutor students can ask questions of in their own words while working through a topic.',
      'Built to learn how to put a model at the centre of a product without the product falling over when the model is slow or wrong — batching, caching, and a UI that degrades gracefully rather than stalling.',
    ],
    stack: ['Python', 'FastAPI', 'React', 'LLM APIs'],
    role: 'Full-stack & AI integration',
    poster: '/projects/drishtikosh.jpg',
    video: { mp4: '/projects/drishtikosh.mp4', webm: '/projects/drishtikosh.webm' },
  },
  {
    id: 'ouroboros-site',
    name: 'Ouroboros — Site',
    year: '2026',
    status: 'production',
    kind: 'learning',
    shape: 'wide',
    tags: ['Front-end', 'Motion', 'Marketing Site'],
    blurb: 'The marketing site for Ouroboros — built and shipped by me.',
    body: [
      'The public site for Ouroboros: the pitch, the product story, and the SDK download. I designed and built the whole front-end.',
      'The brief was to make an autonomous security loop legible to someone who has thirty seconds — hence the "01 discover, 02 think like an attacker, 03 generate fixes" spine, and scroll-driven motion that reveals one idea at a time rather than a wall of copy.',
    ],
    stack: ['Next.js', 'TypeScript', 'GSAP', 'CSS'],
    role: 'Front-end — solo',
    poster: '/projects/ouroboros-site.jpg',
    video: { mp4: '/projects/ouroboros-site.mp4' },
    href: 'https://ouroboroshq.in',
  },
] as const

export const AWARDS_HEADING = ['Awards', '&', 'Recog-', 'nitions'] as const

/* ------------------------------------------------------------------ *
 * Achievements — rendered as the reference's awards table:
 * year | context | org | result, with a hairline under each row and the
 * whole row filling on hover. See docs/REFERENCE.md §8.4.
 * ------------------------------------------------------------------ */

export type AchievementRow = {
  /** Left-hand organisation / event. */
  readonly org: string
  /** Right-hand outcome. */
  readonly result: string
}

export type AchievementGroup = {
  readonly year: string
  /** The project or context the rows belong to. */
  readonly context: string
  readonly rows: readonly AchievementRow[]
}

export type AchievementSection = {
  readonly id: string
  readonly heading: readonly string[]
  readonly groups: readonly AchievementGroup[]
}

// TODO(aditya): fill in the hackathon names and the correct years — I only
// know there were three national wins, so the names below are placeholders.
export const ACHIEVEMENTS: readonly AchievementSection[] = [
  {
    id: 'recognition',
    heading: ['Awards', '&', 'Recog-', 'nitions'],
    groups: [
      {
        year: "'26",
        context: 'Ouroboros',
        rows: [
          { org: 'National Hackathon', result: 'Winner' },
          { org: 'National Hackathons', result: 'Finalist' },
        ],
      },
      {
        year: "'26",
        context: 'CrowdShield',
        rows: [
          { org: 'National Hackathon', result: 'Winner' },
          { org: 'National Hackathons', result: 'Finalist' },
        ],
      },
      {
        year: "'26",
        context: 'International',
        rows: [
          { org: 'SIW Cambodia', result: 'Selected' },
          // TODO(aditya): name the second international selection.
          { org: 'International Hackathon', result: 'Selected' },
        ],
      },
    ],
  },
  {
    id: 'education',
    heading: ['Educa-', 'tion', '&', 'Study'],
    groups: [
      {
        year: "'23—",
        context: 'Vidyalankar Institute of Technology',
        rows: [
          { org: 'B.Tech — Electronics & Computer Science', result: '3rd year' },
        ],
      },
      {
        year: "'23",
        context: 'Higher Secondary',
        rows: [{ org: 'HSC', result: '89.50%' }],
      },
      {
        year: "'21",
        context: 'Secondary',
        rows: [{ org: 'SSC', result: '89.20%' }],
      },
    ],
  },
  {
    id: 'outside',
    heading: ['Outside', 'the', 'termi-', 'nal'],
    groups: [
      {
        year: '—',
        context: 'Away from the screen',
        rows: [
          { org: 'Swimming', result: 'Ongoing' },
          { org: 'Content creation', result: 'Recently started' },
        ],
      },
    ],
  },
] as const
