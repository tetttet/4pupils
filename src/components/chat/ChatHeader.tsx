import Image from "next/image";
import { productBrand } from "@/lib/atlas/brand";
import { ChatAccountMenu } from "./ChatAccountMenu";
import { MenuIcon } from "./icons";

type ChatHeaderProps = {
  activeTitle: string;
  onOpenSidebar: () => void;
};

export function ChatHeader({
  activeTitle,
  onOpenSidebar,
}: ChatHeaderProps) {
  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--header-bg)] px-3 shadow-[0_1px_0_rgba(20,33,61,0.04)] backdrop-blur transition-colors duration-300 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Открыть список чатов"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--control-hover)] hover:text-[var(--text)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
          onClick={onOpenSidebar}
          type="button"
        >
          <MenuIcon />
        </button>
        <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm">
          <Image
            alt={productBrand.logoAlt}
            className="h-15 w-15 -mt-3 object-contain"
            height={32}
            priority
            src={productBrand.logoSrc}
            width={32}
          />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-[var(--text)]">
            {activeTitle}
          </h1>
          <p className="truncate text-xs text-[var(--muted)]">
            {productBrand.assistantName}
          </p>
        </div>
      </div>
      <ChatAccountMenu />
    </header>
  );
}
