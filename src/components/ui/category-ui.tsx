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
        "rounded-full border px-5 py-3 text-[13px] font-medium leading-none transition duration-300 sm:text-[14px]",
        active
          ? "border-[#5D75CB] bg-[#5D75CB] text-white shadow-[0_10px_24px_rgba(93,117,203,0.18)] hover:bg-[#4C63B8]"
          : "border-[#D7DDF8] bg-[#F7F8FF] text-[#3F4568] hover:border-[#B8C2EF] hover:bg-[#ECEFFF] hover:text-[#202858]",
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
      <h2 className="mb-5 text-[14px] font-medium leading-none text-[#202858]">
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
    <label className="group flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          "flex size-5.5 items-center justify-center rounded-[7px] border transition",
          checked
            ? "border-[#5D75CB] bg-[#5D75CB]"
            : "border-[#D7DDF8] bg-[#F7F8FF] group-hover:border-[#B8C2EF]",
        )}
      >
        <span
          className={cn(
            "size-2 rounded-[2px] bg-white transition",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <span className="select-none text-[14px] leading-none text-[#3F4568] transition group-hover:text-[#202858]">
        {label}
      </span>
    </label>
  );
}
