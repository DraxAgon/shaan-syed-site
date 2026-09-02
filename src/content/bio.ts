/* First person, calibrated to how Shaan actually writes.
   Paragraph length is varied on purpose.
   The site is not a resume, so the personal paragraphs carry as much
   weight here as the software ones. */
export const bioParagraphs: string[] = [
  "I'm in the Computer Science and Business Administration double degree at Waterloo and Laurier.",
  "My mom made me start piano when I was eleven. I liked it right up until it got hard, and then I spent a couple of years dreading it. When my first teacher quit, my mom told me I could stop too, and something in me didn't want to. I couldn't have explained why at the time. The teacher I got after him is the reason it turned into something I actually wanted. He never just fixed a section for me. He'd get me to see why it wasn't working and then I'd fix it myself, and it would stay fixed. Years later, most of a practice hour still goes to the same few bars, played again until they stop falling apart, and that's the part I actually like now. Piano is where I figured out that if you don't like the process you don't get to the reward, which sounds obvious and took me years to really believe.",
  "Being taught that way is how I ended up loving teaching. I spent four years on the peer tutoring team at my high school, mostly group sessions plus about ten students one on one, close to a hundred people in total. The goal was never getting someone through that night's homework, it was that they could do the next one without me. Explaining something to a person who isn't getting it is also the fastest way to find the holes in what you thought you understood, which is a big part of why I keep doing it. I also pushed for an afterschool study hall so people could get help without booking a tutor ahead of time or getting assigned one, because the booking was what stopped most of them from coming at all.",
  "I got called unathletic enough as a kid that it's most of why I started running. I picked it up in grade 8 and was bad at it for a while. Distance running is mostly deciding to stay uncomfortable a bit longer than you planned to, and I lost that argument with myself most days before I started winning it. Two years in, in grade 10, I made it to provincials. After a while it stopped being about proving anything to anyone. I want to run the Toronto Marathon at some point.",
  "Coding is the other thing I keep coming back to. I got into it because I wanted to build things I could actually use, and I've mostly taught myself, which really just means building something badly and then working out why it broke. I cook too, which started as a way to stop eating the same three meals.",
  "The projects on this site are what I've built. I'd rather show someone a rough version early and find out what's wrong with it than keep working on it alone.",
];

/* The photo rail that runs down the left of /bio, in page order.
   Every slot ships as an on-brand placeholder at the size listed here,
   so dropping in a real photo of the same name is the only step. The
   sizes differ on purpose: the rail is deliberately ragged, and frames
   of one shape would flatten it back into a column of boxes. */
export type BioPhoto = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export const bioPhotos: BioPhoto[] = [
  {
    src: "/images/portrait-bio.webp",
    alt: "Shaan Syed",
    caption: "Portrait",
    width: 1000,
    height: 1000,
  },
  {
    src: "/images/bio-piano.webp",
    alt: "Shaan at the piano",
    caption: "Seven years at the piano",
    width: 1000,
    height: 1250,
  },
  {
    src: "/images/bio-running.webp",
    alt: "Shaan running a cross country race",
    caption: "Cross country, to provincials",
    width: 1200,
    height: 900,
  },
  {
    src: "/images/bio-kitchen.webp",
    alt: "Shaan cooking",
    caption: "In the kitchen",
    width: 1000,
    height: 1000,
  },
];
