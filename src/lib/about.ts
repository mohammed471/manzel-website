import { getTranslations } from "next-intl/server";
import data from "@/data/about.json";
import { getSiteSections, localized } from "@/lib/siteContent";

// About-page lists (timeline, team, values) are edited in the internal app
// («الموقع» → صفحة من نحن). When the API is unreachable, about.json + the
// `about.timeline_N_*` / `team_N_*` / `value_N_*` translation keys are used.

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string | null;
}

export interface Value {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  timeline: TimelineMilestone[];
  team: TeamMember[];
  values: Value[];
}

export function getTeamMemberImageUrl(image: string): string {
  return /^(https?:)?\//.test(image) ? image : `/about/team/${image}`;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export async function getAboutContent(locale: string): Promise<AboutContent> {
  const sections = await getSiteSections();
  if (sections) {
    return {
      timeline: sections.timeline.map((item) => ({
        year: str(item.year),
        title: localized(item, "title", locale),
        description: localized(item, "description", locale),
      })),
      team: sections.team.map((item, i) => ({
        id: String(item.id ?? i),
        name: localized(item, "name", locale),
        role: localized(item, "role", locale),
        imageUrl: str(item.image) ? getTeamMemberImageUrl(str(item.image)) : null,
      })),
      values: sections.values.map((item, i) => ({
        id: String(item.id ?? i),
        icon: str(item.icon) || "award",
        title: localized(item, "title", locale),
        description: localized(item, "description", locale),
      })),
    };
  }

  const t = await getTranslations({ locale, namespace: "about" });
  return {
    timeline: data.timeline.map((item, i) => ({
      year: item.year,
      title: t(`timeline_${i + 1}_title`),
      description: t(`timeline_${i + 1}_description`),
    })),
    team: data.team.map((member, i) => ({
      id: member.id,
      name: t(`team_${i + 1}_name`),
      role: t(`team_${i + 1}_role`),
      imageUrl: member.image ? getTeamMemberImageUrl(member.image) : null,
    })),
    values: data.values.map((value, i) => ({
      id: value.icon,
      icon: value.icon,
      title: t(`value_${i + 1}_title`),
      description: t(`value_${i + 1}_description`),
    })),
  };
}
