"use client";

import * as React from "react";
import { MessageCircleMore, X } from "lucide-react";

import { indigo_dark, indigo_dark_hover } from "@/constant/color";
import { Button } from "@/components/ui/button";
import {
  FrontierPrivacyPolicyLink,
  FrontierSocialLinks,
} from "@/components/ui/frontier-social-links";

type CourseContactFormState = {
  name: string;
  email: string;
  phone: string;
  studyPlan: "" | "self" | "employer";
  consent: boolean;
};

const INITIAL_FORM_STATE: CourseContactFormState = {
  name: "",
  email: "",
  phone: "",
  studyPlan: "self",
  consent: false,
};

function FormField({
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-lg border border-[#cccccc] bg-[#ffffff] px-4 text-[16px] text-[#1f2a44] outline-none transition placeholder:text-[#747474] focus:border-[#0f0f0f] focus:bg-white"
        required
      />
    </label>
  );
}

export default function CourseContactFab() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  const [formState, setFormState] =
    React.useState<CourseContactFormState>(INITIAL_FORM_STATE);

  const isFormReady =
    Boolean(formState.name.trim()) &&
    Boolean(formState.email.trim()) &&
    Boolean(formState.phone.trim()) &&
    Boolean(formState.studyPlan) &&
    formState.consent;

  const updateField = React.useCallback(
    <K extends keyof CourseContactFormState>(
      field: K,
      value: CourseContactFormState[K],
    ) => {
      setFormState((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const openPanel = React.useCallback(() => {
    setMounted(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
        setOpen(true);
      });
    });
  }, []);

  const closePanel = React.useCallback(() => {
    setIsVisible(false);
    setOpen(false);

    window.setTimeout(() => {
      setMounted(false);
    }, 300);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      studyPlan: formState.studyPlan,
      consent: formState.consent,
      sentAt: new Date().toISOString(),
    };

    console.log("course-contact-request", payload);
    closePanel();
    setFormState(INITIAL_FORM_STATE);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          if (mounted && isVisible) {
            closePanel();
          } else {
            openPanel();
          }
        }}
        className="fixed bottom-4 right-4 z-40 h-10 rounded-lg px-5 text-[14px] font-semibold shadow-[0_20px_60px_rgba(35,48,103,0.28)] sm:bottom-6 sm:right-6 sm:h-10 sm:px-6"
        style={{
          backgroundColor: indigo_dark,
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = indigo_dark_hover;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = indigo_dark;
        }}
      >
        <MessageCircleMore className="h-4.5 w-4.5" />
        Не могу определиться
      </Button>

      {mounted && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <div
            className={`pointer-events-auto fixed left-0 top-0 h-dvh w-screen max-w-none gap-0 rounded-none border-0 bg-[#f6f6f6] p-0 transition-all duration-300 ease-out sm:left-auto sm:right-6 sm:top-auto sm:bottom-24 sm:h-auto sm:w-100 sm:max-w-[calc(100vw-3rem)] sm:rounded-[22px] sm:border sm:border-[#e6e6e6] sm:bg-white sm:p-0 sm:shadow-[0_30px_80px_rgba(28,28,28,0.12)] ${
              isVisible
                ? "translate-y-0 opacity-100 sm:translate-x-0 sm:translate-y-0"
                : "translate-y-4 opacity-0 sm:translate-x-6 sm:translate-y-0"
            }`}
            aria-hidden={!open}
          >
            <div className="flex h-full flex-col sm:max-h-[calc(100vh-10rem)]">
              <div className="border-b border-[#ebebeb] bg-white px-5 py-5 sm:rounded-t-[28px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[28px] font-medium leading-[1.02] tracking-[-0.04em] text-[#2b2b2b]">
                      Давайте поможем
                    </h2>
                    <p className="mt-3 max-w-75 text-[16px] leading-[1.28] text-[#5f5f5f]">
                      Мы перезваниваем в течение 30 минут каждый день с 10:00 до
                      19:00. Если оставите заявку сейчас, то перезвоним уже в
                      рабочее время.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closePanel}
                    aria-label="Закрыть форму"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#6a6a6a] transition hover:bg-[#f3f3f3] hover:text-[#2c2c2c]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <FormField
                    value={formState.name}
                    onChange={(value) => updateField("name", value)}
                    placeholder="Имя *"
                  />
                  <FormField
                    type="email"
                    value={formState.email}
                    onChange={(value) => updateField("email", value)}
                    placeholder="Почта *"
                  />
                  <FormField
                    type="tel"
                    value={formState.phone}
                    onChange={(value) => updateField("phone", value)}
                    placeholder="Контактный телефон *"
                  />

                  <div>
                    <p className="mb-2 text-[14px] font-medium text-[#7a7a7a]">
                      Как планируете учиться?
                    </p>
                    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#efefef] p-1">
                      <button
                        type="button"
                        onClick={() => updateField("studyPlan", "self")}
                        className={`rounded-[14px] px-3 py-3 text-[15px] leading-[1.1] transition ${
                          formState.studyPlan === "self"
                            ? "bg-white text-[#232323] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                            : "text-[#4f4f4f]"
                        }`}
                      >
                        За свой счёт
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("studyPlan", "employer")}
                        className={`rounded-[14px] px-3 py-3 text-[15px] leading-[1.1] transition ${
                          formState.studyPlan === "employer"
                            ? "bg-white text-[#232323] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                            : "text-[#4f4f4f]"
                        }`}
                      >
                        За счёт родителя
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 py-1">
                    <input
                      type="checkbox"
                      checked={formState.consent}
                      onChange={(event) =>
                        updateField("consent", event.target.checked)
                      }
                      className="mt-0.5 h-5 w-5 rounded border-[#d1d1d1] accent-[#233067]"
                      required
                    />
                    <span className="text-[14px] leading-[1.45] text-[#8a8a8a]">
                      Даю согласие на обработку персональных данных в целях
                      обратной связи по заявке.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={!isFormReady}
                    className="h-14 w-full rounded-2xl text-[16px] font-medium shadow-none disabled:opacity-100"
                    style={{
                      backgroundColor: isFormReady ? indigo_dark : "#eeeeee",
                      color: isFormReady ? "#ffffff" : "#b1b1b1",
                    }}
                  >
                    Жду звонка
                  </Button>

                  <FrontierSocialLinks
                    className="justify-center pt-1"
                    itemClassName="h-10 w-10 rounded-xl border-[#e4e4e4] bg-[#f3f3f3] text-[#3d3d3d] shadow-none hover:border-[#d8d8d8] hover:bg-[#ededed]"
                  />

                  <FrontierPrivacyPolicyLink className="block pt-1 text-center text-[14px] text-[#7a7a7a]" />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
