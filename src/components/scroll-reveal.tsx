"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Reveals on scroll, for anything marked data-reveal.

   Nothing wraps the content: pages put the attribute on the element
   they want revealed and this observes every one of them, so the pages
   stay server components and the markup keeps its shape. A revealed
   element is marked and dropped from the observer, so it settles once
   and stays put rather than fading again on the way back up.

   The hidden state is held behind .reveal-ready on <html>, which the
   inline script in the layout sets before the page paints. Without
   scripting the class is never set and every element renders as it
   always did, so the reveal can only ever hide something it is also
   able to show. */
export function ScrollReveal() {
  /* Client navigations swap the page under us without remounting this,
     so the pathname is what says a new set of targets exists. */
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"),
    );

    const showAll = () => {
      root.classList.remove("reveal-ready");
      for (const el of targets) el.setAttribute("data-revealed", "");
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      showAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      /* A little short of the bottom edge, so a frame starts moving
         once it is properly in the window rather than the instant its
         first pixel clears it. */
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    /* An element marked data-reveal-after-scroll is in the window at
       load but is not meant to arrive with whatever is above it. On the
       bio page only the first print lands on load; the rest are held
       out of the observer, so what the reader sees is one photo, and
       then the rail filling in underneath them as they go.

       The hold breaks a short way down the page rather than on the
       first scroll event of any size. A wheel notch or a trackpad
       twitch fires a scroll at a few pixels, which released the next
       print while the page had not visibly moved — it read as a delayed
       part of the load rather than as an answer to the scroll. Once the
       hold breaks the observer decides the rest as it always did: one
       already in the window arrives at once, and the ones further down
       still wait their turn and keep the beat between them.

       Three ways out of the gate, because a held element that is never
       released is a hole in the layout rather than a nicety: nothing is
       held unless the page has room to scroll well past the line, nor
       if the window was restored below it, and the release fires on any
       scroll that reaches it, however it got there. */
    const held = new Set(
      targets.filter((el) => el.hasAttribute("data-reveal-after-scroll")),
    );
    /* Far enough that the page has plainly moved, near enough that a
       single nudge of a wheel or a thumb covers it. */
    const releaseAt = 80;
    const gated =
      held.size > 0 &&
      window.scrollY < releaseAt &&
      root.scrollHeight - window.innerHeight > releaseAt * 2;

    for (const el of targets) {
      if (gated && held.has(el)) continue;
      observer.observe(el);
    }

    if (!gated) return () => observer.disconnect();

    const release = () => {
      if (window.scrollY < releaseAt) return;
      window.removeEventListener("scroll", release);
      for (const el of held) observer.observe(el);
    };
    window.addEventListener("scroll", release, { passive: true });

    return () => {
      window.removeEventListener("scroll", release);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
