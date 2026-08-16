/**
 * services/profile.service.ts
 * ----------------------------------------------------------------------------
 * CRUD for the four small "profile" tables that back the About page and
 * footer: Skill, Experience, Education, SocialLink. Grouped into one file
 * (rather than four) because each is a handful of flat fields with no
 * side effects like re-indexing — unlike projects/posts, nothing here
 * touches the AI assistant's knowledge base.
 * ----------------------------------------------------------------------------
 */
import { prisma } from "@/lib/prisma";
import type {
  SkillFormInput,
  ExperienceFormInput,
  EducationFormInput,
  SocialLinkFormInput,
} from "@/lib/validations";

// --- Skills -------------------------------------------------------------

export async function listSkills() {
  return prisma.skill.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
}
export async function createSkill(input: SkillFormInput) {
  return prisma.skill.create({ data: input });
}
export async function updateSkill(id: string, input: SkillFormInput) {
  return prisma.skill.update({ where: { id }, data: input });
}
export async function deleteSkill(id: string) {
  return prisma.skill.delete({ where: { id } });
}

// --- Experience -----------------------------------------------------------

function toExperienceData(input: ExperienceFormInput) {
  return {
    company: input.company,
    role: input.role,
    location: input.location || null,
    description: input.description,
    startDate: new Date(input.startDate),
    endDate: input.isCurrent || !input.endDate ? null : new Date(input.endDate),
    isCurrent: input.isCurrent,
    order: input.order,
  };
}
export async function listExperience() {
  return prisma.experience.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] });
}
export async function createExperience(input: ExperienceFormInput) {
  return prisma.experience.create({ data: toExperienceData(input) });
}
export async function updateExperience(id: string, input: ExperienceFormInput) {
  return prisma.experience.update({ where: { id }, data: toExperienceData(input) });
}
export async function deleteExperience(id: string) {
  return prisma.experience.delete({ where: { id } });
}

// --- Education ------------------------------------------------------------

function toEducationData(input: EducationFormInput) {
  return {
    institution: input.institution,
    degree: input.degree,
    field: input.field || null,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : null,
    description: input.description || null,
    order: input.order,
  };
}
export async function listEducation() {
  return prisma.education.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] });
}
export async function createEducation(input: EducationFormInput) {
  return prisma.education.create({ data: toEducationData(input) });
}
export async function updateEducation(id: string, input: EducationFormInput) {
  return prisma.education.update({ where: { id }, data: toEducationData(input) });
}
export async function deleteEducation(id: string) {
  return prisma.education.delete({ where: { id } });
}

// --- Social Links -----------------------------------------------------------

export async function listSocialLinks() {
  return prisma.socialLink.findMany({ orderBy: { order: "asc" } });
}
export async function createSocialLink(input: SocialLinkFormInput) {
  return prisma.socialLink.create({ data: input });
}
export async function updateSocialLink(id: string, input: SocialLinkFormInput) {
  return prisma.socialLink.update({ where: { id }, data: input });
}
export async function deleteSocialLink(id: string) {
  return prisma.socialLink.delete({ where: { id } });
}
