"use client";

import Link from "next/link";
import config from "@/lib/config";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { name: "Create", href: "/create" },
      { name: "Gallery", href: "/gallery" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-divider/50 bg-bg-page">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <span className="absolute left-1 top-0.5 text-[7px] font-bold leading-none text-primary-btn-text/70">
                  19
                </span>
                <span className="text-lg font-black leading-none text-primary-btn-text">
                  K
                </span>
              </span>
              <span className="text-[17px] font-black tracking-tight">
                {config.appName}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-secondary-text">
              {config.tagline} Powered by Google&apos;s nano banana image model.
            </p>
          </div>

          <div className="flex gap-14">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-secondary-text">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-secondary-text transition-colors hover:text-primary-text"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-divider/40 pt-6 text-xs text-secondary-text">
          &copy; {year} {config.appName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
