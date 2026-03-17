import data from "@/data/about.json";

export interface TimelineMilestone {
  year: string;
}

export interface TeamMember {
  id: string;
  image: string | null;
}

export interface Value {
  icon: string;
}

export function getTimeline(): TimelineMilestone[] {
  return data.timeline;
}

export function getTeam(): TeamMember[] {
  return data.team;
}

export function getValues(): Value[] {
  return data.values;
}

export function getTeamMemberImageUrl(filename: string): string {
  return `/about/team/${filename}`;
}
