"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PortalTopNav from "../portal/PortalTopNav";

// Search triggers that redirect to the login page. Permissive matching:
// the trigger fires whenever any of these substrings appears in the
// search input (case-insensitive). So typing just "log" already redirects.
const LOGIN_TRIGGERS = ["log", "sign in", "signin", "portal", "seafarer"];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const onInquire = pathname === "/inquire";
  const onHome = pathname === "/";
  const onPortal = pathname?.startsWith("/portal");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function tryLoginRedirect(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return false;
    if (LOGIN_TRIGGERS.some((t) => normalized.includes(t))) {
      setSearchOpen(false);
      setSearchQuery("");
      router.push("/login");
      return true;
    }
    return false;
  }

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
    <header
      className="relative z-10 flex items-center justify-between gap-3"
      style={{
        paddingInline: "clamp(1rem, 4vw, 4rem)",
        paddingTop: "var(--space-4)",
        paddingBottom: "var(--space-3)",
      }}
    >
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <Image
          src="/logo-cs.png"
          alt="Cargo Safeway logo"
          width={64}
          height={64}
          priority
          className="object-contain"
          style={{ width: "clamp(2.25rem, 2vw + 1rem, 3rem)", height: "clamp(2.25rem, 2vw + 1rem, 3rem)" }}
        />
        <span className="hidden sm:flex flex-col leading-tight">
          <span
            className={`font-bold tracking-tight ${
              onHome
                ? "text-neutral-900 lg:text-transparent lg:bg-clip-text lg:bg-gradient-to-b lg:from-white lg:to-emerald-400"
                : "text-neutral-900"
            }`}
            style={{ fontSize: "var(--fs-xl)" }}
          >
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

      <nav
        className={`${onPortal ? "hidden" : "hidden md:flex"} lg:absolute lg:left-1/2 lg:-translate-x-1/2 items-center font-medium text-neutral-700`}
        style={{ gap: "clamp(1.5rem, 2.5vw, 3rem)", fontSize: "var(--fs-sm)" }}
      >
        {[
          { label: "Leadership", href: "/leadership" },
          { label: "Find Us", href: "/contact" },
        ].map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`${onHome ? "hero-on-dark" : ""} sweep-text relative inline-block origin-center transition-transform duration-300 ease-out after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-[#22c55e] after:transition-all after:duration-200 ${
                pathname === item.href ? "scale-125 after:w-full" : "after:w-0 hover:after:w-full"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.label}
              className={`${onHome ? "hero-on-dark" : ""} sweep-text relative cursor-pointer after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#22c55e] after:transition-all after:duration-200 hover:after:w-full`}
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
              onChange={(e) => {
                const next = e.target.value;
                setSearchQuery(next);
                // Auto-redirect when the user finishes typing a login keyword
                tryLoginRedirect(next);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  tryLoginRedirect(searchQuery);
                }
              }}
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
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
                onHome ? "text-white/90 hover:text-emerald-300" : "text-neutral-700"
              } ${
                searchOpen
                  ? "hover:text-[#15803d]"
                  : onHome
                    ? "hover:bg-white/10"
                    : "hover:bg-neutral-100"
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
            aria-current={pathname === "/login" ? "page" : undefined}
            className={`hidden md:grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
              onHome
                ? "text-white/90 hover:text-emerald-300 hover:bg-white/10"
                : "text-neutral-700 hover:bg-neutral-100"
            } ${pathname === "/login" ? "text-[#15803d]" : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M4 20c1.5-3.5 4.7-5.5 8-5.5s6.5 2 8 5.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
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
        ) : onHome ? null : (
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
