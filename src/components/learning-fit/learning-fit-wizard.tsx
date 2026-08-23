"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  GraduationCap,
  Languages,
  Target,
  Wallet,
} from "lucide-react";

import {
  LEARNING_FIT_STORAGE_KEY,
  buildLearningFitResultsHref,
  createLearningFitSubmissionPayload,
  getLearningFitInitialAnswers,
  hasCompleteLearningFitAnswers,
  learningFitBudgets,
  learningFitGoals,
  learningFitLanguages,
  learningFitLevels,
  learningFitSubjects,
  parseLearningFitAnswers,
  type LearningFitAnswers,
} from "@/lib/learning-fit";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type StepKey = keyof LearningFitAnswers;

const steps: Array<{
  key: StepKey;
  title: string;
  description: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  options: ReadonlyArray<{ id: string; label: string; description: string }>;
}> = [
  {
    key: "subject",
    title: "Какое направление хотите изучать?",
    description:
      "Выберите тему, чтобы подбор сразу смотрел на близкие категории и сильные курсы внутри каталога.",
    eyebrow: "Шаг 1",
    icon: Compass,
    options: learningFitSubjects,
  },
  {
    key: "level",
    title: "На каком вы сейчас уровне?",
    description:
      "Это помогает не смешивать базовые курсы со слишком сложными и держать рекомендации в нужном темпе.",
    eyebrow: "Шаг 2",
    icon: GraduationCap,
    options: learningFitLevels,
  },
  {
    key: "goal",
    title: "Какой результат сейчас важнее всего?",
    description:
      "Подсветим курсы под старт, практику, карьеру, экзамен или следующий сильный шаг в теме.",
    eyebrow: "Шаг 3",
    icon: Target,
    options: learningFitGoals,
  },
  {
    key: "language",
    title: "На каком языке вам комфортнее учиться?",
    description:
      "Если язык не принципиален, можно это сразу отметить и оставить подбор шире.",
    eyebrow: "Шаг 4",
    icon: Languages,
    options: learningFitLanguages,
  },
  {
    key: "budget",
    title: "Какой формат по бюджету подходит?",
    description:
      "Учтём бесплатные варианты, разумный бюджет или просто покажем лучшие курсы без жёсткого ограничения.",
    eyebrow: "Шаг 5",
    icon: Wallet,
    options: learningFitBudgets,
  },
];

function readStoredAnswers() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(LEARNING_FIT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      answers?: LearningFitAnswers;
    } | null;

    return parseLearningFitAnswers(parsed?.answers ?? null);
  } catch {
    return null;
  }
}

function getFirstIncompleteStepIndex(answers: LearningFitAnswers) {
  const nextIndex = steps.findIndex((step) => !answers[step.key]);
  return nextIndex === -1 ? steps.length - 1 : nextIndex;
}

function OptionCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-[20px] border p-3.5 text-left transition-all duration-300 sm:p-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D75CB]/30",
        selected
          ? "border-[#5D75CB] bg-[#F3F5FF] shadow-[0_10px_24px_rgba(93,117,203,0.1)]"
          : "border-[#ECEFFF] bg-white hover:border-[#D7DDF8] hover:bg-[#F7F8FF]",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-[#5D75CB] bg-[#5D75CB] text-white"
              : "border-[#D7DDF8] bg-white text-transparent group-hover:border-[#B8C2EF]",
          )}
        >
          <Check className="size-3" strokeWidth={2.8} />
        </div>

        <div className="min-w-0">
          <div className="text-[15px] font-medium leading-[1.15] tracking-[-0.02em] text-[#202858] sm:text-[16px]">
            {title}
          </div>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-[#68719B] sm:text-[13px]">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function LearningFitWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<LearningFitAnswers>(
    getLearningFitInitialAnswers(),
  );
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    const stored = readStoredAnswers();
    if (!stored) return;

    setAnswers((current) => ({ ...current, ...stored }));
    setStepIndex(getFirstIncompleteStepIndex(stored));
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(
        LEARNING_FIT_STORAGE_KEY,
        JSON.stringify({ answers }),
      );
    } catch {
      // Ignore storage errors and keep the flow functional.
    }
  }, [answers]);

  const currentStep = steps[stepIndex];
  const currentValue = answers[currentStep.key];
  const isLastStep = stepIndex === steps.length - 1;
  const completedSteps = steps.filter((step) =>
    Boolean(answers[step.key]),
  ).length;
  const progressWidth = `${(completedSteps / steps.length) * 100}%`;
  const CurrentStepIcon = currentStep.icon;

  const selectOption = (value: string) => {
    setAnswers((current) => ({
      ...current,
      [currentStep.key]: value,
    }));
  };

  const goNext = () => {
    if (!currentValue) return;

    if (isLastStep) {
      if (!hasCompleteLearningFitAnswers(answers)) return;

      const payload = createLearningFitSubmissionPayload(answers);
      console.log("[learning-fit] submission", payload);

      try {
        window.sessionStorage.setItem(
          LEARNING_FIT_STORAGE_KEY,
          JSON.stringify(payload),
        );
      } catch {
        // Ignore storage errors and continue with navigation.
      }

      startTransition(() => {
        router.push(buildLearningFitResultsHref(answers));
      });

      return;
    }

    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  const goPrevious = () => {
    setStepIndex((value) => Math.max(value - 1, 0));
  };

  return (
    <div className="min-h-screen bg-[#F3F5FF] text-[#202858]">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-5 sm:pb-20 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#68719B] transition hover:text-[#233067]"
          >
            <ArrowLeft className="size-4" />К каталогу курсов
          </Link>
          <span className="rounded-full border border-[#D7DDF8] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4C63B8]">
            Заполнено {completedSteps} из {steps.length}
          </span>
        </div>

        <header className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D75CB] sm:text-[12px]">
              Персональный подбор · {brand.name}
            </p>
            <h1 className="mt-3 text-[36px] font-medium leading-[1.02] tracking-[-0.045em] text-[#202858] sm:text-[44px]">
              Найдите подходящее
              <span className="block text-[#5D75CB]">обучение быстрее</span>
            </h1>
          </div>
          <p className="max-w-[54ch] text-[13px] leading-6 text-[#68719B] sm:text-[14px] lg:justify-self-end">
            Пять коротких шагов — и вы получите подборку курсов с учётом темы,
            уровня, цели, языка и бюджета.
          </p>
        </header>

        <main className="mt-7 rounded-[30px] border border-white bg-white p-4 shadow-[0_14px_40px_rgba(35,48,103,0.06)] sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
            <aside className="flex flex-col rounded-[24px] bg-[#ECEFFF] p-5 sm:p-6">
              <div className="grid size-11 place-items-center rounded-full bg-white text-[#5D75CB] shadow-[0_8px_20px_rgba(35,48,103,0.06)]">
                <CurrentStepIcon className="size-5" />
              </div>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5D75CB]">
                {currentStep.eyebrow} из {steps.length}
              </p>
              <h2 className="mt-2 text-[27px] font-medium leading-[1.04] tracking-[-0.04em] text-[#202858] sm:text-[30px]">
                {currentStep.title}
              </h2>
              <p className="mt-3 text-[13px] leading-5.5 text-[#68719B]">
                {currentStep.description}
              </p>

              <div className="mt-auto pt-6">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#68719B]">
                  <span>Прогресс</span>
                  <span>{completedSteps * 20}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-[#5D75CB] transition-all duration-300"
                    style={{ width: progressWidth }}
                  />
                </div>
              </div>
            </aside>

            <section className="flex min-w-0 flex-col">
              <div className="flex items-center justify-between gap-4 px-1 pb-3">
                <p className="text-[13px] font-medium text-[#3F4568]">
                  Выберите один вариант
                </p>
                <p className="text-[12px] text-[#7A82A8]">
                  {stepIndex + 1} / {steps.length}
                </p>
              </div>

              <div className="grid gap-2.5 md:grid-cols-2">
                {currentStep.options.map((option) => (
                  <OptionCard
                    key={option.id}
                    title={option.label}
                    description={option.description}
                    selected={currentValue === option.id}
                    onClick={() => selectOption(option.id)}
                  />
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 border-t border-[#ECEFFF] pt-4 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goPrevious}
                  disabled={stepIndex === 0}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#D7DDF8] bg-[#F7F8FF] px-5 text-[13px] font-medium text-[#4C63B8] transition hover:bg-[#ECEFFF] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Назад
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!currentValue || isPending}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#233067] px-5 text-[13px] font-medium text-white transition hover:bg-[#19224c] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLastStep ? "Показать рекомендации" : "Продолжить"}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
