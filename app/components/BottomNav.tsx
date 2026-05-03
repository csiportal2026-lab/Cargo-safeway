"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  match: (path: string) => boolean;
  icon: React.ReactNode;
};

const ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    match: (p) => p === "/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Fleet",
    href: "/fleet",
    match: (p) => p.startsWith("/fleet"),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 17h18l-1.6 3a1 1 0 0 1-.9.5H5.5a1 1 0 0 1-.9-.5L3 17z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M5 17V9l7-4 7 4v8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M12 5v12" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    label: "About",
    href: "/leadership",
    match: (p) => p.startsWith("/leadership"),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M5 20c1.4-3.4 4.2-5 7-5s5.6 1.6 7 5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "/contact",
    match: (p) => p.startsWith("/contact"),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "/";

  // Hide on portal pages — they have their own nav model
  if (pathname.startsWith("/portal")) return null;
  if (pathname === "/login") return null;

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4 max-w-md mx-auto">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="contents">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition-colors ${
                  active
                    ? "text-[#15803d]"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-7 rounded-full bg-[#15803d]"
                  />
                )}
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
