import { indigo_dark, indigo_dark_hover } from "@/constant/color";
import Link from "next/link";

const BaseButton = ({ href, label }: { href: string; label: string }) => {
  return (
    <Link
      className={`inline-flex h-9.5 items-center justify-center rounded-lg bg-[${indigo_dark}] px-8 text-[16px] font-medium text-white transition-colors hover:bg-[${indigo_dark_hover}]`}
      href={href}
    >
      {label}
    </Link>
  );
};

export default BaseButton;
