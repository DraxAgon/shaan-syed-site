/* First person, four paragraphs, in Shaan's own words. The program and
   why, then the thing he is building now, then what running and piano
   and software have in common, then an open door. The Built and
   Experience columns on the home page and the lists under this carry
   the record, so nothing here repeats a list. */
export const bioParagraphs: string[] = [
  "I'm Shaan, and I'm a double degree student pursuing computer science at Waterloo and business administration at Laurier. I chose the double degree because I wanted to understand the real-world constraints on the software I write and how the call to build it gets made in the first place.",
  "Right now I'm building Redi AI. You tell it what you're interviewing for, and it asks you the questions; you answer out loud, and then it tells you what was actually weak about what you said. I'm building it because everyone tells you to practice out loud, which mostly means repeating an answer you can't tell is bad.",
  "I crave the hit that comes with solving a hard problem, which is probably why I fell in love with running and piano. Piano is practice sessions on the same four mind-numbing bars until the change you need to make suddenly makes sense and every finger lands together to produce a sound you can't get any other way. Running works much the same. It's pushing when all you want to do is quit and talk yourself into a few more minutes because you know what's waiting on the other side: the satisfaction of finishing that last lap and getting to be done. That payoff is why I enjoy building software. It's the bug you've been on since noon and still aren't done with, and you stay on it because you know how good it's going to feel when it finally gives.",
  "Always up for a conversation. I like building with other people and chasing down problems that don't have obvious answers.",
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
