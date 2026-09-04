"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

/* A photo you can open.

   Every still on the site is small where it sits: the portrait is 208px,
   the bio rail is four prints about 150px wide on a phone. Clicking one
   puts it up at the size it was taken at, over the page.

   The overlay is portalled to the body rather than rendered in place,
   because the bio frames are rotated and a transformed ancestor becomes
   the containing block for anything fixed inside it, which would pin the
   overlay to the frame instead of the window. */
export function Photo({
  src,
  alt,
  width,
  height,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  /* The overlay only exists once somebody has clicked, which cannot
     happen on the server, so the portal never looks for a document that
     is not there. */
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  /* While it is open the page underneath does not scroll, Escape closes
     it, and Tab stays inside. */
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = overlay.current?.querySelectorAll<HTMLElement>(
        "button, [href], [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="photo-open"
        aria-label={`${alt}. Open larger`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          className={className}
        />
        <span aria-hidden="true" className="photo-cue">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3 14 10" />
            <path d="M3 21l7-7" />
          </svg>
        </span>
      </button>

      {open
        ? createPortal(
            <div
              ref={overlay}
              className="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              /* Anywhere off the photo closes it, which is what a
                 backdrop is for. Only the photo itself is exempt: the
                 block around it runs the width of the window so a
                 click can land well clear of a tall print and still be
                 inside it. */
              onClick={(event) => {
                const hitPhoto =
                  event.target instanceof Element &&
                  event.target.closest(".lightbox-img");
                if (!hitPhoto) close();
              }}
            >
              <div className="lightbox-figure">
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  sizes="(min-width: 1200px) 1100px, 100vw"
                  className="lightbox-img"
                  /* The file's real dimensions, for the CSS to size the
                     photo off rather than the intrinsic size a srcset
                     candidate reports. */
                  style={
                    {
                      "--photo-w": String(width),
                      "--photo-h": String(height),
                      "--photo-ratio": String(width / height),
                    } as CSSProperties
                  }
                />
                {/* The only thing under the photo, and it reads as a
                    quiet line of type rather than a control until the
                    pointer is on it. Clicking the backdrop does the
                    same, so this is the visible half of a habit people
                    already have. */}
                <button
                  type="button"
                  className="lightbox-close"
                  autoFocus
                  onClick={close}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
