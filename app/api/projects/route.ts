import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { projectFormSchema } from "@/lib/validations";
import { listPublishedProjects, listAllProjectsForAdmin, createProject } from "@/services/project.service";

export const runtime = "nodejs";

/** GET — public: published projects (optionally filtered), or, with ?admin=1 and a valid session, every project. */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  if (searchParams.get("admin") === "1") {
    try {
      await requireAdminSession();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const status = searchParams.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
    const projects = await listAllProjectsForAdmin(status ?? undefined);
    return NextResponse.json({ projects });
  }

  const projects = await listPublishedProjects({
    search: searchParams.get("search") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
  });
  return NextResponse.json({ projects });
}

/** POST — admin only: create a project (auth also enforced by middleware.ts). */
export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = projectFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid project data", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existingSlug = await import("@/lib/prisma").then(({ prisma }) => prisma.project.findUnique({ where: { slug: parsed.data.slug } }));
  if (existingSlug) {
    return NextResponse.json({ error: "That slug is already taken" }, { status: 409 });
  }

  const project = await createProject(parsed.data);
  return NextResponse.json(project, { status: 201 });
}
