/**
 * lib/constants.ts
 * ----------------------------------------------------------------------------
 * ⚠️ THIS IS THE FIRST FILE TO EDIT AFTER SETUP.
 * Every value below is a placeholder used only so the site renders correctly
 * out of the box. Replace everything marked TODO with your real information.
 * (Project/blog/testimonial content lives in the database via /admin —
 * this file is only for identity, navigation, and copy that isn't a
 * "content" row of its own.)
 * ----------------------------------------------------------------------------
 */

export const SITE = {
  // TODO: replace with your real name — used in <title>, JSON-LD, and the navbar.
  // Falls back to NEXT_PUBLIC_SITE_NAME if set, but editing this directly is the
  // primary path (see SETUP_GUIDE.docx §9.1) — the env var is a convenience for
  // platforms where you'd rather not touch source for a one-word change.
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Anord Jailos Mfilinge",

  // TODO: a one-line role/positioning statement shown in the hero.
  tagline: "Data Scientist, AI Engineer & Backend Developer building intelligent data-driven solutions",


  // TODO: 2–3 sentence bio used in the hero subhead and meta description.
  shortBio: "I build intelligent systems using data science, machine learning, and modern software engineering. I transform data into practical AI solutions, analytics platforms, and automation tools.",
  // TODO: longer bio for the About page (markdown supported where rendered).

  longBio: `
I am Anord Jailos Mfilinge, a Data Scientist passionate about artificial intelligence,
machine learning, analytics, and building technology that solves real-world problems.

My journey focuses on combining data science with software engineering to create
intelligent applications. I work with Python, SQL, machine learning frameworks,
data visualization tools, and modern AI technologies to develop solutions ranging
from predictive analytics to AI-powered systems.

I have experience working on machine learning projects, fraud detection,
predictive modeling, AI data solutions, and building applications that turn complex
data into actionable insights. I enjoy exploring emerging technologies including
agentic AI, retrieval-augmented generation (RAG), and intelligent automation.

I am always interested in collaborating on innovative projects involving AI,
data, software engineering, and digital transformation.
`,
  email: "anordyjailos044@gmail.com", // TODO
  location: "Dar es Salaam, Tanzania", // TODO
  avatarUrl: "/images/Anord1.jpeg", // TODO: add a real photo to public/images/
  resumeUrl: "/ANORD_JAILOS_RESUME.pdf", // TODO: add your resume PDF to /public
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "AI Assistant", href: "/assistant" },
  { label: "Contact", href: "/contact" },
];

/**
 * Suggested opening prompts shown in the AI assistant before the visitor
 * types anything. Keep these aligned with what's actually in your knowledge
 * base (projects, experience, FAQs) so the assistant always has something
 * grounded to answer with.
 */
export const SUGGESTED_PROMPTS = [
  "What have you been working on recently?",
  "What's your experience with AI/ML?",
  "Are you available for freelance work?",
  "Walk me through your most impressive project.",
];

/**
 * FAQ entries double as both a visible FAQ list and knowledge-base source
 * material for the assistant. Edit freely — these get embedded when you
 * click "Sync knowledge base" in /admin/knowledge-base.
 */
export const FAQS: { question: string; answer: string }[] = [
  {
    question: "What services do you offer?",
    answer:
      "I work on data science projects, machine learning solutions, AI-powered applications, analytics dashboards, backend systems, and automation solutions.",
  },
  {
    question: "What's your typical availability?",
    answer:
      "I am open to professional collaborations, freelance opportunities, AI and data science projects, and technology-focused partnerships.",
  },
  {
    question: "Do you work with early-stage startups?",
    answer:
      "Yes. I enjoy working with startups and organizations that want to use data, AI, and software solutions to build innovative products.",
  },
];

export const BOOKING_DURATIONS_MIN = [15, 30, 60] as const;

export const SEO_DEFAULTS = {
  titleTemplate: `%s — ${SITE.name}`,
  defaultTitle: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.shortBio,
  ogImage: "/images/og-default.jpg", // TODO: add a 1200x630 social share image
};
