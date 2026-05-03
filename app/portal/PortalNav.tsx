"use client";

import { useState } from "react";

type Item = { label: string };

const SECTIONS: { label: string; items: Item[] }[] = [
  {
    label: "Profile",
    items: [{ label: "Personal Profile" }, { label: "Family / Next-of-Kin" }],
  },
  {
    label: "Deployment",
    items: [
      { label: "My Availability" },
      { label: "Application" },
      { label: "Voyage History" },
      { label: "Contract Status" },
      { label: "Document Vault" },
    ],
  },
  {
    label: "Compensation",
    items: [{ label: "Payslips" }, { label: "Travel Allotments" }],
  },
];

export default function PortalNav() {
  const [active, setActive] = useState<string>("Personal Profile");

  return (
    <nav className="w-full lg:w-[260px] shrink-0 bg-white p-3 sm:p-4 lg:shadow-[1px_0_0_0_rgba(0,0,0,0.04),4px_0_12px_-8px_rgba(0,0,0,0.06)]">
      {SECTIONS.map((section, idx) => (
        <div key={section.label} className={idx === 0 ? "" : "mt-4"}>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            {section.label}
          </div>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = active === item.label;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setActive(item.label)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                      isActive
                        ? "bg-[#15803d]/10 text-[#15803d]"
                        : "text-neutral-700 hover:bg-[#15803d]/5 hover:text-[#15803d] hover:translate-x-0.5"
                    }`}
                  >
                    <span className="text-[13px] font-semibold leading-tight">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
