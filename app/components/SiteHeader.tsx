"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PortalTopNav from "../portal/PortalTopNav";

export default function SiteHeader() {
  const pathname = usePathname();
  const onInquire = pathname === "/inquire";
  const onLogin = pathname === "/login";
  const onPortal = pathname?.startsWith("/portal");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);
  return (
    <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 md:px-12 pt-4 sm:pt-5 pb-3 sm:pb-4">
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <Image
          src="/logo-cs.jpg"
          alt="Cargo Safeway logo"
          width={64}
          height={64}
          priority
          className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
        />
        <span className="hidden sm:flex flex-col leading-tight">
          <span className="text-[20px] sm:text-[22px] font-bold tracking-tight text-neutral-900">
            Cargo Safeway
          </span>
          {onPortal && (
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#15803d]">
              Portal
            </span>
          )}
        </span>
      </Link>

      {onPortal && <PortalTopNav />}

      <nav className={`${onPortal ? "hidden" : "hidden md:flex"} items-center gap-9 text-[13px] font-medium text-neutral-700`}>
        {[
          { label: "Fleet", href: "/fleet" },
          { label: "Leadership", href: "/leadership" },
          { label: "Find Us", href: "/contact" },
        ].map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`relative transition-colors after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-[#15803d] after:transition-all after:duration-200 ${
                pathname === item.href
                  ? "text-[#15803d] after:w-full"
                  : "text-neutral-700 hover:text-[#15803d] after:w-0 hover:after:w-full"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.label}
              className="relative cursor-pointer text-neutral-700 transition-colors hover:text-[#15803d] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#15803d] after:transition-all after:duration-200 hover:after:w-full"
            >
              {item.label}
            </span>
          ),
        )}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div ref={wrapperRef} className="relative h-9 w-9">
          <div
            className={`absolute right-0 top-0 flex items-center h-9 rounded-full transition-all duration-300 ${
              searchOpen
                ? "w-44 bg-neutral-100 pl-3 pr-1"
                : "w-9 bg-transparent"
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              tabIndex={searchOpen ? 0 : -1}
              className={`flex-1 min-w-0 bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-500 outline-none transition-opacity duration-200 ${
                searchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />
            <button
              type="button"
              aria-label={
                searchOpen
                  ? searchQuery
                    ? "Clear search"
                    : "Close search"
                  : "Search"
              }
              onClick={() => {
                if (searchOpen && searchQuery) {
                  setSearchQuery("");
                  inputRef.current?.focus();
                  return;
                }
                setSearchOpen((s) => !s);
              }}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-700 transition-colors ${
                searchOpen ? "hover:text-[#15803d]" : "hover:bg-neutral-100"
              }`}
            >
              {searchOpen && searchQuery ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M18 6 6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {!onPortal && (
          <Link
            href="/login"
            aria-label="Log in"
            aria-current={onLogin ? "page" : undefined}
            title="Log in"
            className={
              onLogin
                ? "h-9 w-9 grid place-items-center rounded-full border-2 border-[#15803d] text-[#15803d] bg-transparent transition-colors"
                : "h-9 w-9 grid place-items-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#15803d] transition-colors"
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20c1.5-3.5 4.7-5.5 8-5.5s6.5 2 8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>
        )}
        {onPortal ? (
          <Link
            href="/"
            className="rounded-full bg-[#15803d] px-3 sm:px-5 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-medium text-white shadow-sm hover:bg-[#126a33] transition-colors"
          >
            Log Out
          </Link>
        ) : (
          <Link
            href="/inquire"
            aria-current={onInquire ? "page" : undefined}
            className={
              onInquire
                ? "rounded-full border-2 border-[#15803d] bg-transparent px-3 sm:px-[18px] py-[5px] sm:py-[6px] text-[12px] sm:text-[13px] font-semibold text-[#15803d] hover:bg-[#15803d]/5 transition-colors"
                : "rounded-full bg-[#15803d] px-3 sm:px-5 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-medium text-white shadow-sm hover:bg-[#126a33] transition-colors"
            }
          >
            Inquire Now
          </Link>
        )}
      </div>
    </header>
  );
}
