import { indigo_dark, indigo_dark_hover } from "@/constant/color";
import { cn } from "@/lib/utils";

export function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-6 py-4 text-[16px] font-normal leading-none transition",
        active
          ? `border-[${indigo_dark}] bg-[${indigo_dark}] text-white hover:bg-[${indigo_dark_hover}]`
          : "border-[#d0d0d0] bg-transparent text-[#363636] hover:bg-[#e9e9e9]",
      )}
    >
      {label}
    </button>
  );
}

export function FilterSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-5 text-[16px] font-semibold leading-none text-[#262626]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          "flex h-6.25 w-6.25 items-center justify-center rounded-sm border transition",
          checked
            ? "border-[#2b2b2b] bg-[#242424]"
            : "border-[#cfcfcf] bg-transparent",
        )}
      >
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-sm bg-white transition",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <span className="text-[16px] font-normal leading-none text-[#2f2f2f] select-none">
        {label}
      </span>
    </label>
  );
}
