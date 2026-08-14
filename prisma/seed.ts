/**
 * prisma/seed.ts
 * ----------------------------------------------------------------------------
 * Populates the database with placeholder content so the site is fully
 * navigable immediately after setup, and creates your first admin login.
 *
 * Run with: npm run db:seed
 *
 * IMPORTANT: every string below is a placeholder. Replace it with your real
 * bio, projects, and history via the admin dashboard (/admin) once it's
 * running — do not ship this placeholder copy to production. See
 * SETUP_GUIDE.docx §6 "Replacing placeholder content" for the full checklist.
 *
 * This script does NOT generate embeddings (that requires a live
 * OPENAI_API_KEY call). After editing your real content, go to
 * /admin/knowledge-base and click "Sync knowledge base" to (re)index
 * everything for the AI assistant.
 */
import { PrismaClient, ProjectStatus, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user -----------------------------------------------------------
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "you@yourdomain.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "change-me-immediately";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Anord Jailos", // TODO: replace
      role: "ADMIN",
      passwordHash,
    },
  });
  console.log(`✓ Admin user ready: ${adminEmail} (change the password after first login)`);

  // --- Projects ---------------------------------------------------------------
  const projects = [
    {
      title: "Project One — Replace Me",
      slug: "project-one",
      summary: "One sentence describing the problem this project solved.",
      description:
        "## Overview\n\nReplace this with the real case study: the problem, your approach, the stack, and the outcome. Markdown is supported.\n\n## Result\n\nQuantify the impact if you can (e.g. latency, revenue, users).",
      tags: ["Next.js", "TypeScript", "PostgreSQL"],
      githubUrl: "https://github.com/yourname/project-one",
      liveUrl: "https://example.com",
      featured: true,
      status: ProjectStatus.PUBLISHED,
      order: 1,
    },
    {
      title: "Project Two — Replace Me",
      slug: "project-two",
      summary: "One sentence describing the problem this project solved.",
      description: "## Overview\n\nReplace this with your real case study content.",
      tags: ["Python", "Machine Learning"],
      githubUrl: "https://github.com/yourname/project-two",
      liveUrl: null,
      featured: true,
      status: ProjectStatus.PUBLISHED,
      order: 2,
    },
    {
      title: "Project Three — Draft Example",
      slug: "project-three",
      summary: "An unpublished draft to show the DRAFT status filter in admin.",
      description: "Still being written up.",
      tags: ["Experiment"],
      featured: false,
      status: ProjectStatus.DRAFT,
      order: 3,
    },
  ];
  for (const p of projects) {
    await prisma.project.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log(`✓ Seeded ${projects.length} projects`);

  // --- Blog posts ---------------------------------------------------------
  const posts = [
    {
      title: "Welcome to My Blog — Replace This Post",
      slug: "welcome-to-my-blog",
      excerpt: "A short first post to confirm the blog pipeline works end to end.",
      content:
        "# Welcome\n\nThis is placeholder content generated during setup. Write your first real post from `/admin/blog`, or edit this one.",
      category: "Announcements",
      tags: ["meta"],
      status: PostStatus.PUBLISHED,
      readingTimeMin: 2,
      publishedDate: new Date(),
    },
  ];
  for (const post of posts) {
    await prisma.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: post });
  }
  console.log(`✓ Seeded ${posts.length} blog post(s)`);

  // --- Skills ---------------------------------------------------------------
  const skills = [
    { name: "TypeScript", category: "Languages", level: 5, order: 1 },
    { name: "React / Next.js", category: "Frontend", level: 5, order: 2 },
    { name: "Node.js", category: "Backend", level: 4, order: 3 },
    { name: "PostgreSQL", category: "Data", level: 4, order: 4 },
    { name: "AI / LLM Integration", category: "AI", level: 4, order: 5 },
    { name: "System Design", category: "Architecture", level: 4, order: 6 },
  ];
  await prisma.skill.createMany({ data: skills, skipDuplicates: true });
  console.log(`✓ Seeded ${skills.length} skills (edit freely — these are generic placeholders)`);

  // --- Experience -------------------------------------------------------------
  await prisma.experience.createMany({
    data: [
      {
        company: "Current Company — Replace Me",
        role: "Your Title",
        location: "Remote",
        description: "Describe your responsibilities and impact in this role.",
        startDate: new Date("2023-01-01"),
        isCurrent: true,
        order: 1,
      },
      {
        company: "Previous Company — Replace Me",
        role: "Previous Title",
        location: "City, Country",
        description: "Describe your responsibilities and impact in this role.",
        startDate: new Date("2020-01-01"),
        endDate: new Date("2022-12-31"),
        isCurrent: false,
        order: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Seeded experience timeline");

  // --- Education ------------------------------------------------------------
  await prisma.education.createMany({
    data: [
      {
        institution: "Your University — Replace Me",
        degree: "B.Sc. in Your Field",
        field: "Computer Science",
        startDate: new Date("2016-09-01"),
        endDate: new Date("2020-06-01"),
        order: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Seeded education");

  // --- Testimonials -----------------------------------------------------------
  await prisma.testimonial.createMany({
    data: [
      {
        authorName: "A Colleague — Replace Me",
        authorRole: "Engineering Manager",
        company: "Company Name",
        quote:
          "Replace with a real quote from a manager, client, or collaborator once you have permission to publish it.",
        order: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Seeded testimonials");

  // --- Social links -------------------------------------------------------
  await prisma.socialLink.createMany({
    data: [
      { platform: "github", url: "https://github.com/yourname", order: 1 },
      { platform: "linkedin", url: "https://linkedin.com/in/yourname", order: 2 },
      { platform: "twitter", url: "https://x.com/yourname", order: 3 },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Seeded social links");

  // --- Availability (Mon–Fri, 9am–5pm UTC by default) --------------------
  await prisma.availabilityRule.createMany({
    data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      timezone: "UTC",
      isActive: true,
    })),
    skipDuplicates: true,
  });
  console.log("✓ Seeded availability rules (Mon–Fri, 9am–5pm UTC — edit in /admin)");

  console.log("\nSeed complete. Log in at /admin/login with:");
  console.log(`  email:    ${adminEmail}`);
  console.log(`  password: ${adminPassword} (change this immediately)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
