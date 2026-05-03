"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = { label: string; href: string };

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Profile",
    items: [{ label: "My Profile", href: "/portal" }],
  },
  {
    label: "Document",
    items: [{ label: "Document", href: "/portal/document-vault" }],
  },
  {
    label: "Payslips",
    items: [{ label: "Payslips", href: "/portal/payslips" }],
  },
  {
    label: "Travel Allotments",
    items: [{ label: "Travel Allotments", href: "/portal/travel-allotments" }],
  },
];

export default function PortalTopNav() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openSection) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpenSection(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenSection(null);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [openSection]);

  return (
    <div
      ref={wrapperRef}
      className="hidden md:flex items-center gap-1 sm:gap-2"
    >
      {SECTIONS.map((section) => {
        const isOpen = openSection === section.label;
        const activeItem = section.items.find((i) => pathname === i.href);
        const hasActive = !!activeItem;
        const isSingle = section.items.length === 1;

        if (isSingle) {
          const only = section.items[0];
          const isActive = pathname === only.href;
          return (
            <Link
              key={section.label}
              href={only.href}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors shrink-0 ${
                isActive
                  ? "bg-[#15803d]/10 text-[#15803d]"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d]"
              }`}
            >
              {section.label}
            </Link>
          );
        }

        return (
          <div key={section.label} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? null : section.label)}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                hasActive
                  ? "bg-[#15803d]/10 text-[#15803d]"
                  : isOpen
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d]"
              }`}
            >
              {activeItem ? activeItem.label : section.label}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-2 min-w-[220px] rounded-xl bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] ring-1 ring-neutral-200 p-1.5 dropdown-pop"
              >
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpenSection(null)}
                      className={`block w-full text-left rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-[#15803d]/10 text-[#15803d] font-semibold"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
