export type Certification = {
  name: string;
  issuer?: string;
  date?: string;
  href?: string;
  /* Software certifications also surface on the front page. The
     lifeguarding and tutoring ones stay on Awards. */
  software?: boolean;
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
        software: true,
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
      { name: "Learn2Learn Certified Peer Tutor" },
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

/* Earned software certifications, in the order they appear above.
   The front page shows these; the full record lives on Awards. */
export const softwareCertifications: Certification[] = certifications
  .filter((group) => group.label === "Completed")
  .flatMap((group) => group.items)
  .filter((cert) => cert.software);
