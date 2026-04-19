import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { indigo_dark, indigo_dark_hover } from "@/constant/color";

const CoursesHeader = () => {
  return (
    <header className="bg-white">
      <div className="mx-auto flex w-full max-w-355 items-center justify-between px-4 py-2 sm:px-8 lg:px-10 xl:px-12 2xl:px-0">
        <Logo className="shrink-0" />

        <Button asChild size="sm" className={`rounded-sm py-4.5 px-4 bg-[${indigo_dark}] hover:bg-[${indigo_dark_hover}]`}>
          <Link href="/auth/sign-up">Войти</Link>
        </Button>
      </div>
    </header>
  );
};

export default CoursesHeader;
