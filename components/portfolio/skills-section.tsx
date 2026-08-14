import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/portfolio/section-heading";

export async function SkillsSection() {
  const skills = await prisma.skill.findMany({ orderBy: { order: "asc" } }).catch(() => []);


  type Skill = (typeof skills)[number];

  const byCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }

      acc[skill.category]!.push(skill);
      return acc;
    }, {});




  // const byCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
  //   (acc[skill.category] ??= []).push(skill);
  //   return acc;
  // }, {});

  const categories = Object.entries(byCategory);
  if (categories.length === 0) return null;

  return (
    <section className="container py-24">
      <SectionHeading eyebrow="Toolbox" title="Skills & stack" />
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(([category, items]) => (
          <div key={category}>
            <h3 className="font-mono text-xs uppercase tracking-wider text-foreground-faint">{category}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {items.map((skill) => (
                <li key={skill.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{skill.name}</span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-signal-gradient"
                      style={{ width: `${(skill.level / 5) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
