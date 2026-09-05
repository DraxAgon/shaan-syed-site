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
       load but is not meant to arrive with whatever is above it. The
       photo rail is two columns on a phone, so its first two prints
       share a row and used to slide in together, which read as the page
       loading in halves rather than one print landing and the rest
       following. Held out of the observer, they wait for the first
       scroll and then come in exactly as they always did — the observer
       decides when, so one already in the window arrives at once and
       the ones below it still wait their turn.

       Three ways out of the gate, because a held element that is never
       released is a hole in the layout rather than a nicety: nothing is
       held unless the page can actually be scrolled, or if the window
       was restored partway down, and the release runs on the first
       scroll of any kind. */
    const held = new Set(
      targets.filter((el) => el.hasAttribute("data-reveal-after-scroll")),
    );
    const gated =
      held.size > 0 &&
      window.scrollY === 0 &&
      root.scrollHeight > window.innerHeight + 4;

    for (const el of targets) {
      if (gated && held.has(el)) continue;
      observer.observe(el);
    }

    if (!gated) return () => observer.disconnect();

    const release = () => {
      for (const el of held) observer.observe(el);
    };
    window.addEventListener("scroll", release, { passive: true, once: true });

    return () => {
      window.removeEventListener("scroll", release);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
