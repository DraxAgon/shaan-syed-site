export type Certification = {
  name: string;
  issuer?: string;
  date?: string;
  href?: string;
};

export type CertificationGroup = {
  label: "Completed" | "In progress";
  items: Certification[];
};

/* The two groups are labelled with the literal words. An in-progress
   certification is never presented as earned. */
export const certifications: CertificationGroup[] = [
  {
    label: "Completed",
    items: [
      {
        name: "Google Cloud Generative AI Leader",
        issuer: "Google",
        date: "August 2026",
        href: "https://www.credly.com/badges/5623f722-17da-49bf-84b4-e112fccf3fde/public_url",
      },
      {
        name: "National Lifeguard",
        issuer: "Lifesaving Society Ontario",
        date: "April 2025",
      },
      {
        name: "Standard First Aid & CPR-C, Bronze Cross, Bronze Medallion, Bronze Star",
        issuer: "Royal Life Saving Society",
      },
      { name: "2Learn Certified Peer Tutor" },
    ],
  },
  {
    label: "In progress",
    items: [
      { name: "Microsoft Azure Fundamentals (AZ-900)" },
      { name: "Microsoft Azure AI Fundamentals" },
      { name: "GitHub Foundations (GH-900)" },
      { name: "NVIDIA Generative AI LLMs (NCA-GENL)" },
    ],
  },
];
