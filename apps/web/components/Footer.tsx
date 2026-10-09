import { navLinks, socialLinks } from "@/lib/info";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconMapPin,
} from "@tabler/icons-react";
import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

/* ── Inline SVG social icons ── */

export function YouTubeIcon({ className }: { className?: string }) {
  return <IconBrandYoutube className={className} />;
}

export function FacebookIcon({ className }: { className?: string }) {
  return <IconBrandFacebook className={className} />;
}

export function InstagramIcon({ className }: { className?: string }) {
  return <IconBrandInstagram className={className} />;
}

export function TikTokIcon({ className }: { className?: string }) {
  return <IconBrandTiktok className={className} />;
}

export const socialIconMap: Record<string, React.FC<{ className?: string }>> = {
  YouTube: YouTubeIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
};

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden">
      {/* Glassy top divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/10 to-transparent dark:via-white/20 pointer-events-none z-20" />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/3 via-transparent to-transparent dark:from-primary/6 pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 pt-16 md:pt-16 pb-6">
        {/* ── Main grid: Location · Socials · Links ── */}
        <div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-12 md:gap-8">
          {/* Location */}
          <div className="flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
              Our Location
            </h3>
            <p className="text-lg leading-snug mb-5">
              Arrow of Deliverance Ministry,
              <br />
              Jalingo, Taraba State, Nigeria
            </p>
            <Link
              href="https://maps.app.goo.gl/hrqBHLsDPAXc3b8J7"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-fit rounded-md",
              )}
            >
              <IconMapPin className="size-4" />
              Visit Us
            </Link>
          </div>

          {/* Social links */}
          <div className="flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
              Connect With Us
            </h3>
            <ul className="grid grid-cols-2 gap-3">
              {socialLinks.map(({ name, href }) => {
                const Icon = socialIconMap[name];
                return (
                  <li key={name}>
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/social flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-foreground/2 hover:bg-foreground/6 dark:bg-white/3 dark:hover:bg-white/8 transition-all duration-200"
                    >
                      {Icon && (
                        <Icon className="size-5 shrink-0 text-muted-foreground group-hover/social:text-foreground transition-colors" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
                          {name}
                        </span>
                      </div>
                      <IconArrowUpRight className="size-3.5 ml-auto shrink-0 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/social:opacity-60 group-hover/social:translate-y-0 group-hover/social:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Page links */}
          <div className="flex flex-col md:items-center">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
              Quick Links
            </h3>
            <nav>
              <ul className="flex flex-col gap-1">
                {navLinks.map(({ name, href }) => (
                  <li key={name}>
                    <Link
                      href={href}
                      className="group/link flex items-center gap-2 py-2 text-base text-foreground/80 hover:text-foreground transition-colors"
                    >
                      <span className="h-px w-0 group-hover/link:w-4 bg-primary transition-all duration-300" />
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="mt-8 mb-8 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        {/* ── Large typographic ministry name ── */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-6xl md:text-8xl leading-[0.85] font-bold font-heading tracking-tight text-foreground/10 dark:text-foreground/10 select-none pointer-events-none">
            Arrow of Deliverance Ministries
          </h2>
          <span className="text-sm text-muted-foreground mt-6">
            © {new Date().getFullYear()} Arrow of Deliverance Ministries
            Int&apos;l. All rights reserved.
          </span>
        </div>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </footer>
  );
}
