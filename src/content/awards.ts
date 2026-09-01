export type Award = {
  title: string;
  context?: string;
  year?: string;
};

/* One line each. This is a record, not a trophy case. */
export const awards: Award[] = [
  {
    year: "2026",
    title: "3rd Place, Best Use of Base44",
    context: "Ignition Hacks",
  },
  {
    year: "2026",
    title: "President's Scholarship of Distinction",
    context: "University of Waterloo",
  },
  { title: "2x DECA Ontario Provincial Qualifier" },
  { title: "OFSAA Provincial Qualifier, Cross Country" },
  { title: "Honour Roll", context: "Northern Secondary School" },
];
