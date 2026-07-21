"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoMenu } from "react-icons/io5";
import { FiLogOut, FiPlus, FiUser, FiZap } from "react-icons/fi";
import config from "@/lib/config";

const NAV_LINKS = [
  { name: "Create", path: "/create" },
  { name: "Gallery", path: "/gallery" },
  { name: "Pricing", path: "/pricing" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet on navigation.
  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled || pathname !== "/"
          ? "border-b border-glass-border bg-bg-page/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          {/* Periodic-table tile: K, atomic number 19 (potassium — the banana element) */}
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary transition-transform group-hover:rotate-6">
            <span className="absolute inset-0 rounded-xl bg-primary blur-md opacity-50" />
            <span className="absolute left-1 top-0.5 text-[7px] font-bold leading-none text-primary-btn-text/70">
              19
            </span>
            <span className="relative text-lg font-black leading-none text-primary-btn-text">
              K
            </span>
          </span>
          <span className="text-[17px] font-black tracking-tight">
            {config.appName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`relative rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                  isActive ? "text-primary-text" : "text-secondary-text hover:text-primary-text"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-glass-hover"
                  />
                )}
                <span className="relative">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-[13px] font-bold transition-colors hover:bg-glass-hover"
              >
                <FiZap className="text-xs text-primary" />
                {session.user.credits ?? 0}
                <FiPlus className="text-xs text-secondary-text" />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 180)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-glass-border bg-glass-bg transition-colors hover:bg-glass-hover"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FiUser className="text-secondary-text" size={15} />
                  )}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.16 }}
                      className="glass-dropdown absolute right-0 top-11 z-[100] w-52 rounded-xl p-1 shadow-2xl"
                    >
                      <div className="truncate border-b border-divider/50 px-3 py-2 text-xs text-secondary-text">
                        {session.user.email}
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <FiLogOut size={14} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link
              href="/create"
              className="rounded-full bg-primary px-5 py-2 text-[13px] font-bold text-primary-btn-text transition-transform hover:scale-[1.04] active:scale-95"
            >
              Start free
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {status === "authenticated" && (
            <span className="flex items-center gap-1 rounded-full border border-glass-border bg-glass-bg px-2.5 py-1 text-xs font-bold">
              <FiZap className="text-[10px] text-primary" />
              {session.user.credits ?? 0}
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="rounded-lg border border-glass-border p-2 transition-colors hover:bg-glass-hover"
          >
            {isOpen ? <IoClose size={18} /> : <IoMenu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-dropdown absolute inset-x-0 top-full z-[200] px-6 py-5 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-primary-text hover:bg-glass-hover"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="my-3 h-px bg-divider/60" />

              {status === "authenticated" ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 py-3 text-sm font-bold text-red-400"
                >
                  <FiLogOut size={15} />
                  Sign out
                </button>
              ) : (
                <Link
                  href="/create"
                  className="rounded-lg bg-primary py-3 text-center text-sm font-bold text-primary-btn-text"
                >
                  Start free
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
