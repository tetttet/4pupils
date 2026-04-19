import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/faq";
import H2Text from "../text/h2-text";

export function FaqsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-12 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 md:p-4 lg:p-6">
        <div className="px-4 pb-6 pt-12 md:px-8">
          <div className="space-y-5">
            <H2Text
              title="Часто задаваемые вопросы"
              className="text-[var(--frontier-home-ink)]!"
            />
            <p className="text-[var(--frontier-home-ink-muted)]">
              Быстрые ответы на часто задаваемые вопросы об Efferd. Откройте
              любой вопрос, чтобы узнать больше.
            </p>
            <p className="text-[var(--frontier-home-ink-muted)]">
              {"Не можете найти то, что ищете? "}
              <a
                className="text-[var(--frontier-home-primary)] transition-colors hover:text-[var(--frontier-home-primary-deep)] hover:underline"
                href="#"
              >
                Связаться с нами
              </a>
            </p>
          </div>
        </div>
        <div className="relative place-content-center bg-white">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-[rgba(var(--frontier-home-primary-rgb),0.32)] to-transparent" />

          <Accordion collapsible type="single">
            {faqs.map((item) => (
              <AccordionItem
                className="group relative border-b border-[rgba(var(--frontier-home-border-rgb),0.82)] pl-3 first:border-t last:border-b"
                key={item.id}
                value={item.id}
              >
                <AccordionTrigger className="px-4 py-4 text-[15px] leading-6 text-[var(--frontier-home-ink)] transition-colors hover:text-[var(--frontier-home-primary)] hover:no-underline">
                  {item.title}
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 text-[var(--frontier-home-ink-muted)]">
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
