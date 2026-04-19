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
        "group rounded-[28px] border p-4 text-left transition-all duration-200 sm:p-5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/20",
        selected
          ? "border-[#242424] bg-[#f1f1f1]"
          : "border-[#e4e4e4] bg-white hover:border-[#d0d0d0] hover:bg-[#f7f7f7]",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-[#242424] bg-[#242424] text-white"
              : "border-[#cfcfcf] bg-white text-transparent group-hover:border-[#9d9d9d]",
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
        </div>

        <div className="min-w-0">
          <div className="text-[18px] font-normal leading-[1.08] tracking-[-0.035em] text-[#222222]">
            {title}
          </div>
          <p className="mt-2 text-[14px] leading-[1.45] text-[#666666] sm:text-[15px]">
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
    <div className="min-h-screen bg-white text-[#252525]">
      <div className="mx-auto max-w-355 px-4 pb-28 pt-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-0">
        <header className="max-w-245">
          <p className="text-[34px] font-normal leading-[1.08] tracking-[-0.04em] text-[#2a2a2a] sm:text-[48px]">
            {`Подбор обучения ${brand.upper}`}
          </p>
          <p className="mt-0.5 text-[26px] font-normal leading-[1.12] tracking-[-0.04em] text-[#bdbdbd] sm:text-[48px]">
            Пять коротких шагов, чтобы быстро выйти на подходящие курсы
          </p>
        </header>

        <div className="mt-8 w-full">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[15px] text-[#5c5c5c] transition hover:text-[#242424]"
          >
            <ArrowLeft className="h-4 w-4" />К каталогу курсов
          </Link>

          <main className="mt-5 rounded-[32px] border border-[#e5e5e5] bg-white p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 border-b border-[#ececec] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl">
                <p className="text-[14px] font-medium uppercase tracking-[0.16em] text-[#7c7c7c]">
                  {currentStep.eyebrow} / {steps.length}
                </p>
                <h1 className="mt-3 text-[32px] font-normal leading-[1.02] tracking-[-0.05em] text-[#222222] sm:text-[42px]">
                  {currentStep.title}
                </h1>
                <p className="mt-3 text-[15px] leading-normal text-[#666666] sm:text-[17px]">
                  {currentStep.description}
                </p>
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#efefef]">
              <div
                className="h-full rounded-full bg-[#242424] transition-all duration-300"
                style={{ width: progressWidth }}
              />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
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

            <div className="mt-8 flex flex-col gap-3 border-t border-[#ececec] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goPrevious}
                disabled={stepIndex === 0}
                className="inline-flex h-12 items-center justify-center rounded-sm border border-[#d9d9d9] bg-white px-5 text-[15px] text-[#2f2f2f] transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Назад
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!currentValue || isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-[#242424] px-5 text-[15px] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isLastStep ? "Показать рекомендации" : "Продолжить"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
