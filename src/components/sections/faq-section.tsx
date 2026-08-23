import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/faq";

export function FaqsSection() {
  return (
    <section className="relative overflow-hidden bg-transparent py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 px-4 sm:px-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative isolate min-h-[390px] overflow-hidden rounded-[28px] bg-[#ECEFFF] p-7 sm:rounded-[32px] sm:p-9 lg:h-full lg:min-h-0 lg:p-10">
          <div className="pointer-events-none absolute -bottom-36 -left-28 -z-10 size-[430px] rounded-full border-[72px] border-white opacity-70" />
          <div className="pointer-events-none absolute -right-16 top-16 -z-10 size-44 rounded-full border-[38px] border-[#5D75CB] opacity-[0.06]" />

          <div className="flex h-full flex-col">
            <h2 className="max-w-[10ch] text-[36px] font-medium leading-[1.04] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[50px]">
              Часто задаваемые вопросы
            </h2>
            <p className="mt-6 max-w-[40ch] text-[13px] leading-6 text-[#68719B] sm:text-[14px]">
              Быстрые ответы на часто задаваемые вопросы о 4P Education. Откройте
              любой вопрос, чтобы узнать больше.
            </p>
            <p className="mt-auto pt-8 text-[13px] leading-6 text-[#68719B] sm:text-[14px]">
              {"Не можете найти то, что ищете? "}
              <a
                className="font-medium text-[#4C63B8] underline decoration-[#B8C2EF] underline-offset-4 transition-colors hover:text-[#233067]"
                href="#"
              >
                Связаться с нами
              </a>
            </p>
          </div>
        </div>
        <div className="relative">
          <Accordion collapsible type="single" className="space-y-3">
            {faqs.map((item) => (
              <AccordionItem
                className="group relative overflow-hidden rounded-[22px] border border-[#ECEFFF] bg-[#F7F8FF] px-1 transition duration-300 last:border-b data-[state=open]:border-[#D7DDF8] data-[state=open]:bg-white data-[state=open]:shadow-[0_14px_34px_rgba(35,48,103,0.06)] sm:rounded-[26px] sm:px-2"
                key={item.id}
                value={item.id}
              >
                <AccordionTrigger className="px-4 py-5 text-[15px] font-medium leading-6 text-[#202858] transition-colors hover:text-[#4C63B8] hover:no-underline sm:px-5 sm:py-6 sm:text-[16px] [&_svg]:size-5 [&_svg]:text-[#5D75CB]">
                  {item.title}
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-5 text-[13px] leading-6 text-[#68719B] sm:px-5 sm:pb-6 sm:text-[14px]">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
