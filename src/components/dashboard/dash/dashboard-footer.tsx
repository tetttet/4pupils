import { Logo } from "../../layout/logo";
import { brand } from "@/lib/brand";

export function DashboardFooter() {
  return (
    <footer className="border-t">
      <div className="flex h-14 w-full items-center justify-between px-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-20">
            <Logo />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()}</span>
          <span>{brand.lms}</span>
        </div>
      </div>
    </footer>
  );
}
