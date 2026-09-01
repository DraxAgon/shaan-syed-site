"use client";

/* The only client component on the site. It exists solely to read the
   current pathname so the active route can be marked, which is not
   available to a server layout. */

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/", label: "Home" },
  { href: "/bio", label: "Bio" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 list-none m-0 p-0">
        {routes.map((route) => {
          const isCurrent =
            route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);

          return (
            <li key={route.href}>
              <Link
                href={route.href}
                className="nav-link"
                aria-current={isCurrent ? "page" : undefined}
              >
                {route.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
