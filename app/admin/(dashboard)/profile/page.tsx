import { listSkills, listExperience, listEducation, listSocialLinks } from "@/services/profile.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { SkillsManager } from "@/components/admin/skills-manager";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { EducationManager } from "@/components/admin/education-manager";
import { SocialLinksManager } from "@/components/admin/social-links-manager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default async function AdminProfilePage() {
  const [skills, experience, education, socialLinks] = await Promise.all([
    listSkills(),
    listExperience(),
    listEducation(),
    listSocialLinks(),
  ]);

  return (
    <div>
      <AdminHeader title="Profile" description="Skills, experience, education, and social links shown on About and in the footer." />
      <div className="p-6">
        <Tabs defaultValue="skills">
          <TabsList>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <SkillsManager skills={skills} />
          </TabsContent>
          <TabsContent value="experience">
            <ExperienceManager items={experience} />
          </TabsContent>
          <TabsContent value="education">
            <EducationManager items={education} />
          </TabsContent>
          <TabsContent value="social">
            <SocialLinksManager links={socialLinks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
