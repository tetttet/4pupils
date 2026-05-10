import { productBrand } from "@/lib/atlas/brand";
import { ChatAccountMenu } from "./ChatAccountMenu";

type ChatHeaderProps = {
  activeTitle: string;
  onOpenSidebar: () => void;
};

function FloatingMenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 7.5H16.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M7.5 12H19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M5 16.5H14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ChatHeader({ activeTitle, onOpenSidebar }: ChatHeaderProps) {
  return (
    <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex h-16 shrink-0 items-center justify-between px-3 sm:px-5">
      <div className="pointer-events-auto flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          aria-label="Открыть список чатов"
          className="group grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--muted)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--control-hover)] hover:text-[var(--text)] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
          onClick={onOpenSidebar}
          type="button"
        >
          <span className="transition-transform duration-200 group-hover:scale-110">
            <FloatingMenuIcon />
          </span>
        </button>

        <div className="min-w-0 rounded-2xl bg-[var(--surface)] px-4 py-2 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <h1 className="truncate text-sm font-semibold leading-5 text-[var(--text)] sm:text-base">
            {activeTitle}
          </h1>

          <p className="truncate text-xs leading-4 text-[var(--muted)]">
            {productBrand.assistantName}
          </p>
        </div>
      </div>

      <div className="pointer-events-auto ml-3 shrink-0 rounded-2xl bg-[var(--surface)] p-1 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <ChatAccountMenu />
      </div>
    </header>
  );
}
