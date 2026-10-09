"use client";

import { logo, navLinks } from "@/lib/info";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { useRef, useState, useEffect } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ── 1. Entrance animation on mount ──
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      // Set initial states
      gsap.set(header, { y: -100, opacity: 0 });

      if (logoRef.current) {
        gsap.set(logoRef.current, { x: -40, opacity: 0 });
      }

      const navLinks = desktopNavRef.current?.querySelectorAll("a");
      if (navLinks?.length) {
        gsap.set(navLinks, { y: -20, opacity: 0 });
      }

      if (menuBtnRef.current) {
        gsap.set(menuBtnRef.current, { x: 40, opacity: 0 });
      }

      // Build entrance timeline
      const entranceTl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      entranceTl
        // Header slides down
        .to(header, {
          y: 0,
          opacity: 1,
          duration: 0.6,
        })
        // Logo slides in from left
        .to(
          logoRef.current,
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
          },
          "-=0.3",
        )
        // Nav links stagger in
        .to(
          navLinks ?? [],
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
          },
          "-=0.25",
        )
        // Mobile menu button fades in from right
        .to(
          menuBtnRef.current,
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
          },
          "-=0.3",
        );
    },
    { scope: headerRef },
  );

  // ── 2. Scroll-triggered hide/show ──
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      const showNav = gsap
        .from(header, {
          yPercent: -100,
          paused: true,
          duration: 0.3,
          ease: "power2.out",
        })
        .progress(1);

      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (self) => {
          if (self.direction === -1) {
            showNav.play();
          } else {
            showNav.reverse();
          }
        },
      });
    },
    { scope: headerRef },
  );

  // ── 3. Mobile menu animation with reverse ease ──
  // Keep the menu mounted and drive open/close via timeline play/reverse
  useEffect(() => {
    if (menuOpen) {
      const frame = requestAnimationFrame(() => setMenuVisible(true));
      menuTlRef.current?.reversed(false).play();
      return () => cancelAnimationFrame(frame);
    } else if (menuTlRef.current) {
      // Reverse with a snappier ease
      menuTlRef.current.reversed(true);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuVisible || !mobileMenuRef.current) return;

    const container = mobileMenuRef.current;
    const links = container.querySelectorAll("a");

    // Build the timeline once
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.out" },
      onReverseComplete: () => {
        setMenuVisible(false);
      },
    });

    tl.fromTo(
      container,
      { opacity: 0, y: -10, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3 },
    ).fromTo(
      links,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, stagger: 0.06 },
      "-=0.15",
    );

    menuTlRef.current = tl;
    tl.play();

    return () => {
      tl.kill();
      menuTlRef.current = null;
    };
  }, [menuVisible]);

  return (
    <header
      ref={headerRef}
      className="header fixed top-0 left-0 z-100 w-full py-3"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          ref={logoRef}
          href="/"
          className="shrink-0 flex items-center gap-1 rounded-4xl px-4 text-lg font-bold text-white "
        >
          <Image src={logo} width="50" height="50" alt="ADMI" loading="eager" />
          {/* <span className="pr-2 font-heading">ADMI</span> */}
        </Link>

        <nav
          ref={desktopNavRef}
          className="nav backdrop-blur-md hidden gap-2 rounded-lg p-2 font-medium text-white transition-colors duration-300 md:flex bg-primary/75"
        >
          {navLinks.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-4 py-2 transition-colors duration-200",
                  isActive
                    ? "bg-white text-black"
                    : "text-white hover:bg-foreground hover:text-background",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        {/* <Link
          href="/plan-visit"
          className={cn(
            "group hidden! h-fit! items-center justify-center gap-2 pr-1! py-1! transition-transform duration-300 hover:-translate-y-0.5 md:flex!",
            buttonVariants({ size: "lg", variant: "secondary" }),
            "bg-foreground! text-background! hover:bg-accent-foreground!",
          )}
        >
          Plan a Visit
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-foreground transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
            <IconArrowUpRight className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
          </span>
        </Link> */}

        <Button
          ref={menuBtnRef}
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex p-4 items-center text-lg justify-center rounded-4xl border border-white/20 bg-primary/75 backdrop-blur-md text-white transition-colors hover:bg-primary/90 md:hidden"
        >
          Menu
          {menuOpen ? (
            <IconX className="size-6" />
          ) : (
            <IconMenu2 className="size-6" />
          )}
        </Button>
      </div>

      {menuVisible && (
        <div
          ref={mobileMenuRef}
          className="mx-4 mt-3 rounded-2xl border border-white/10 bg-foreground p-3 shadow-lg backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col gap-2 text-background">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-md px-4 py-3 text-left transition-colors duration-200",
                    isActive
                      ? "bg-background text-foreground"
                      : "hover:bg-background hover:text-foreground",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
