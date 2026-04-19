import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export const Logo = ({ className }: LogoProps) => (
  <Link href="/o/" className={cn("inline-flex items-center", className)}>
    {/* <Image
      src="/images/logo/logo-mini-rvbg.png"
      alt={`${brand.lms} Logo`}
      width={150}
      height={40}
    /> */}
    <Image
      src="/logos/logo-long-removebg.png"
      alt={`${brand.lms} Logo`}
      width={160}
      height={50}
    />
  </Link>
);
