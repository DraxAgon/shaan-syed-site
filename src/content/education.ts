export type EducationEntry = {
  institution: string;
  credential: string;
  dates: string;
  note?: string;
  logo: string | null;
};

/* One double degree across two institutions, not two unrelated degrees. */
export const doubleDegree = {
  heading: "Double degree",
  summary: "One program, taken across both schools over five years.",
  entries: [
    {
      institution: "University of Waterloo",
      credential: "Computer Science",
      dates: "August 2026 to April 2031",
      note: "President's Scholarship of Distinction",
      logo: "/images/logo-waterloo.webp",
    },
    {
      institution: "Wilfrid Laurier University",
      credential: "Business Administration (BBA)",
      dates: "August 2026 to April 2031",
      logo: "/images/logo-laurier.webp",
    },
  ] satisfies EducationEntry[],
};

export const highSchool: EducationEntry = {
  institution: "Northern Secondary School",
  credential: "Toronto, ON",
  dates: "2022 to 2026",
  note: "98.33% average",
  logo: "/images/logo-northern.webp",
};

/* Context, not a second resume. No dates needed. */
export const highSchoolRecord: string[] = [
  "Founder and President, Target Alpha Chapter, second largest in Canada",
  "Treasurer, Northern Model United Nations Club",
  "Class Representative, Northern Senate, three years",
  "VP of Production, Junior Achievement Company Program",
  "2x DECA Ontario Provincial Qualifier",
  "OFSAA Provincial Qualifier, Cross Country",
  "Peer Tutor, Learn2Learn certified",
];

export const interests: string[] = [
  "Lifeguarding for the City of Toronto",
  "Long distance running",
  "Piano, more than seven years",
  "Recreational soccer with North Toronto Soccer",
  "Swimming",
  "Cooking",
];
