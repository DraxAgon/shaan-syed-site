/* First person, three paragraphs, kept short on purpose: the program
   and why, then the work he wants, then what he does outside software.
   The Built and Experience columns on the home page and the lists under
   this carry the rest, so nothing here repeats a list. The hackathon
   result is the fixed wording from projects.ts, a sponsor track
   placement, never a win. */
export const bioParagraphs: string[] = [
  "I chose the Computer Science and Business Administration double degree at Waterloo and Laurier because I'd been doing both halves and didn't want to give one up. The software half was mostly self-taught, building something badly and then working out why it broke. Rilo, my AI reply assistant for Gmail, launched on the Chrome Web Store in July 2026, and shipping it alone meant Stripe billing as a sole proprietorship, refund terms, and the store's review. The business half was a summer of market research for Strello Health's U.S. expansion.",
  "Every AI email tool I tried wrote in its own voice, which is why Rilo gives you drafts in several tones, and it reads only the email open on screen, never the rest of the inbox. At Ignition Hacks we built Phantom, which uses satellite data to test whether a carbon credit prevented any deforestation, and took 3rd Place, Best Use of Base44, a sponsor track. Choosing what a product does and why is the job I want, so I'm aiming for product management.",
  "I started running in grade 8, and after two slow years I made the Ontario provincials in grade 10. Piano came earlier, at eleven. My second teacher never fixed a section for me, and most of a practice hour still goes to the same few bars, working out why they break. Cooking began as a way to stop eating the same three meals.",
];

/* The photo rail that runs down the left of /bio, in page order.
   The frames carry no captions on purpose: the writing next to them
   already says what they are, and a line of type under each print
   turned the rail into a list. The sizes differ because the rail is
   deliberately ragged, and frames of one shape would flatten it back
   into a column of boxes. */
export type BioPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const bioPhotos: BioPhoto[] = [
  {
    src: "/images/bio-grad.webp",
    alt: "Shaan in cap and gown on a lawn with the Toronto skyline behind him",
    width: 1000,
    height: 1333,
  },
  {
    src: "/images/bio-piano.webp",
    alt: "Shaan at a grand piano on a darkened stage",
    width: 1000,
    height: 1704,
  },
  {
    src: "/images/bio-noodles.webp",
    alt: "Shaan grinning over a cup of instant noodles at a table of friends",
    width: 1000,
    height: 750,
  },
  {
    src: "/images/bio-city.webp",
    alt: "Shaan downtown in front of an ice sculpture, towers behind him",
    width: 1000,
    height: 1333,
  },
];
