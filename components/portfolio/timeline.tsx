import { prisma } from "@/lib/prisma";
import { formatMonthYear } from "@/lib/utils";
import { SectionHeading } from "@/components/portfolio/section-heading";

export async function Timeline() {
  const [experience, education] = await Promise.all([
    prisma.experience.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.education.findMany({ orderBy: { order: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <div>
        <SectionHeading eyebrow="Career" title="Experience" />
        <ol className="mt-8 flex flex-col gap-8 border-l border-border pl-6">
          {experience.map((role) => (
            <li key={role.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-signal-gradient" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="font-display text-lg text-foreground">{role.role}</h3>
                <span className="font-mono text-xs text-foreground-faint">
                  {formatMonthYear(role.startDate)} — {role.isCurrent ? "Present" : role.endDate ? formatMonthYear(role.endDate) : ""}
                </span>
              </div>
              <p className="text-sm text-foreground-muted">
                {role.company}
                {role.location ? ` · ${role.location}` : ""}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{role.description}</p>
            </li>
          ))}
          {experience.length === 0 && (
            <p className="text-sm text-foreground-faint">Add your work history from /admin.</p>
          )}
        </ol>
      </div>

      <div>
        <SectionHeading eyebrow="Background" title="Education" />
        <ol className="mt-8 flex flex-col gap-8 border-l border-border pl-6">
          {education.map((edu) => (
            <li key={edu.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-signal-gradient" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="font-display text-lg text-foreground">{edu.degree}</h3>
                <span className="font-mono text-xs text-foreground-faint">
                  {formatMonthYear(edu.startDate)} — {edu.endDate ? formatMonthYear(edu.endDate) : "Present"}
                </span>
              </div>
              <p className="text-sm text-foreground-muted">
                {edu.institution}
                {edu.field ? ` · ${edu.field}` : ""}
              </p>
              {edu.description && <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{edu.description}</p>}
            </li>
          ))}
          {education.length === 0 && (
            <p className="text-sm text-foreground-faint">Add your education from /admin.</p>
          )}
        </ol>
      </div>
    </div>
  );
}
