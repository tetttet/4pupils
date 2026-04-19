"use client";

import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type FrontierSocialLink = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type FrontierSocialLinksProps = {
  className?: string;
  itemClassName?: string;
};

export const frontierSocialLinks: FrontierSocialLink[] = [
  { title: "Instagram", href: "#", icon: InstagramIcon },
  { title: "LinkedIn", href: "#", icon: LinkedinIcon },
  { title: "YouTube", href: "#", icon: YoutubeIcon },
  { title: "Facebook", href: "#", icon: FacebookIcon },
];

export function FrontierSocialLinks({
  className,
  itemClassName,
}: FrontierSocialLinksProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {frontierSocialLinks.map((link) => {
        const Icon = link.icon;

        return (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.title}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7deea] bg-white text-[#233067] shadow-[0_10px_24px_rgba(35,48,103,0.08)] transition hover:-translate-y-0.5 hover:border-[#c0cce2]",
              itemClassName,
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </a>
        );
      })}
    </div>
  );
}

export function FrontierPrivacyPolicyLink({
  className,
}: {
  className?: string;
}) {
  return (
    <Link
      href="/docs/privacy-policy"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "text-[12px] leading-[1.35] text-[#69748c] underline underline-offset-4 transition hover:text-[#233067]",
        className,
      )}
    >
      Политика конфиденциальности
    </Link>
  );
}
