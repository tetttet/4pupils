"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Course } from "@/types/course";
import type {
  CourseApplication,
  CourseApplicationDraftPayload,
} from "@/types/course-application";
import type { User } from "@/types/user";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { CourseApplicationsAPI } from "@/services/course-application";
import { indigo_dark, indigo_dark_hover } from "@/constant/color";

type Props = {
  course: Course;
  viewer: User | null;
  currentApplication: CourseApplication | null;
  courseHref: string;
  signInHref: string;
  signUpHref: string;
};

type FormState = {
  message: string;
  experience_text: string;
  motivation_text: string;
  portfolio_url: string;
  resume_url: string;
};

function createEmptyForm(): FormState {
  return {
    message: "",
    experience_text: "",
    motivation_text: "",
    portfolio_url: "",
    resume_url: "",
  };
}

function normalizeText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toDraftPayload(form: FormState): CourseApplicationDraftPayload {
  return {
    message: normalizeText(form.message),
    experience_text: normalizeText(form.experience_text),
    motivation_text: normalizeText(form.motivation_text),
    portfolio_url: normalizeText(form.portfolio_url),
    resume_url: normalizeText(form.resume_url),
  };
}

function getViewerName(viewer: User | null) {
  if (!viewer) return "Гость";
  const fullName = `${viewer.first_name} ${viewer.last_name}`.trim();
  return fullName || viewer.email;
}

export default function CourseApplicationFormPage({
  course,
  viewer,
  currentApplication,
  courseHref,
  signInHref,
  signUpHref,
}: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(createEmptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingSubmit, setPendingSubmit] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.motivation_text.trim()) {
      setError("Опишите, зачем вам этот курс — это поле обязательно.");
      return;
    }

    setPendingSubmit(true);

    try {
      await CourseApplicationsAPI.create(
        course.course_id,
        toDraftPayload(form),
      );
      router.replace(courseHref);
    } catch (submitError) {
      setError(
        getUserFacingErrorMessage(
          submitError,
          "Не удалось отправить заявку на курс.",
        ),
      );
      setPendingSubmit(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-5 text-gray-900">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-5">
          <BreadcrumbList className="text-sm text-gray-500">
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Link href="/">Курсы</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbLink
                asChild
                className="truncate text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Link href={courseHref}>{course.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              <BreadcrumbPage>Заявка</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Two-column layout */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Main card */}
          <div className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white">
            {/* Card header */}
            <div className="border-b border-gray-200 px-6 py-5">
              <h1 className="text-xl font-medium text-gray-900">
                Заявка на курс «{course.title}»
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                Заполните форму. После отправки вы вернётесь на страницу курса,
                где будет виден статус заявки.
              </p>
            </div>

            {/* Card body */}
            <div className="px-6 py-5">
              {/* Meta row */}
              <div className="mb-5 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-gray-50 px-3 py-2.5">
                  <p className="text-xs text-gray-500">Курс</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 truncate">
                    {course.title}
                  </p>
                </div>
                <div className="rounded-md bg-gray-50 px-3 py-2.5">
                  <p className="text-xs text-gray-500">Аккаунт</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 truncate">
                    {getViewerName(viewer)}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* State: not logged in */}
              {!viewer ? (
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <h2 className="text-base font-medium text-gray-900">
                    Чтобы отправить заявку, сначала войдите
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                    После авторизации вы вернётесь на эту страницу и сможете
                    сразу заполнить заявку на курс.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={signUpHref}
                      className={`inline-flex h-9 items-center rounded-md bg-[${indigo_dark}] px-5 text-sm font-medium text-white hover:bg-[${indigo_dark_hover}] transition-colors`}
                    >
                      Создать аккаунт
                    </Link>
                    <Link
                      href={signInHref}
                      className={`inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-[${indigo_dark_hover}] transition-colors`}
                    >
                      Уже есть аккаунт
                    </Link>
                  </div>
                </div>
              ) : currentApplication ? (
                /* State: application already exists */
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                      <FileTextIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-medium text-gray-900">
                        Заявка по этому курсу уже существует
                      </h2>
                      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                        Повторно отправлять не нужно. Вернитесь на страницу
                        курса, чтобы посмотреть статус или получить доступ.
                      </p>
                      <Link
                        href={courseHref}
                        className={`mt-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-[${indigo_dark}] px-5 text-sm font-medium text-white hover:bg-[${indigo_dark_hover}] transition-colors`}
                      >
                        Открыть курс
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* State: form */
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Motivation — full width */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-sm text-gray-600">
                        Почему вам нужен этот курс
                        <span className="ml-0.5 text-red-500">*</span>
                      </label>
                      <textarea
                        value={form.motivation_text}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            motivation_text: e.target.value,
                          }))
                        }
                        placeholder="Например: хочу системно изучить тему и получить практику."
                        disabled={pendingSubmit}
                        required
                        rows={4}
                        className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* Experience */}
                    <div className="space-y-1.5">
                      <label className="block text-sm text-gray-600">
                        Опыт
                      </label>
                      <textarea
                        value={form.experience_text}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            experience_text: e.target.value,
                          }))
                        }
                        placeholder="Что вы уже изучали или где применяли эти навыки."
                        disabled={pendingSubmit}
                        rows={3}
                        className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="block text-sm text-gray-600">
                        Сообщение преподавателю
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, message: e.target.value }))
                        }
                        placeholder="Если есть конкретный вопрос или контекст."
                        disabled={pendingSubmit}
                        rows={3}
                        className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* Portfolio */}
                    <div className="space-y-1.5">
                      <label className="block text-sm text-gray-600">
                        Портфолио
                      </label>
                      <input
                        type="url"
                        value={form.portfolio_url}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            portfolio_url: e.target.value,
                          }))
                        }
                        placeholder="https://portfolio.example"
                        disabled={pendingSubmit}
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* Resume */}
                    <div className="space-y-1.5">
                      <label className="block text-sm text-gray-600">
                        Резюме или LinkedIn
                      </label>
                      <input
                        type="url"
                        value={form.resume_url}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, resume_url: e.target.value }))
                        }
                        placeholder="https://linkedin.com/in/..."
                        disabled={pendingSubmit}
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
                    <div className="flex items-center text-[10px] text-gray-500">
                      После отправки заявки мы свяжемся с вами по email,
                      указанному в аккаунте, с дальнейшими инструкциями. Обычно
                      это занимает от нескольких часов до пары дней.
                    </div>
                    <button
                      type="submit"
                      disabled={pendingSubmit}
                      className={`inline-flex whitespace-nowrap h-9 items-center rounded-md bg-[${indigo_dark}] px-5 text-sm font-medium text-white transition hover:bg-[${indigo_dark_hover}] disabled:bg-[${indigo_dark}] disabled:cursor-not-allowed`}
                    >
                      {pendingSubmit ? "Отправляем..." : "Отправить заявку"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-medium text-gray-900">
                Что произойдёт дальше
              </h2>
            </div>
            <ul>
              {[
                "Заполните поля заявки",
                "Нажмите «Отправить заявку»",
                "Мы вернём вас к курсу — статус появится в блоке доступа",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border-t border-gray-100 px-5 py-3.5 first:border-t-0"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[${indigo_dark}] text-xs font-medium text-white mt-0.5`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Back link */}
            <div className="border-t border-gray-200 px-5 py-4">
              <Link
                href={courseHref}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Вернуться к курсу
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
