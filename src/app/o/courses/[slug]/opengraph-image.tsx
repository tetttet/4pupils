import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";
import {
  getCoursePriceLabel,
  getCourseSeoDescription,
  getPublicCourse,
  isCourseFree,
  normalizeCourseLabel,
  trimText,
} from "@/lib/public-course";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Course preview";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CourseOgImage({ params }: Props) {
  const { slug } = await params;
  const course = await getPublicCourse(slug);

  const title = course ? trimText(course.title, 70) : `Курс ${brand.name}`;
  const description = course
    ? trimText(getCourseSeoDescription(course), 150)
    : "Премиальная страница курса с чёткой структурой, понятными результатами и аккуратной product-подачей.";
  const priceLabel = course ? getCoursePriceLabel(course) : brand.name;
  const category = course?.category || "Курс";
  const level = normalizeCourseLabel(course?.level);
  const language = normalizeCourseLabel(course?.language);
  const access = course
    ? isCourseFree(course)
      ? "Бесплатный доступ"
      : "Премиум доступ"
    : "Preview";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          padding: "56px",
          background:
            "linear-gradient(135deg, #08111f 0%, #0f2f4a 32%, #1174B0 72%, #78d3ff 125%)",
          color: "white",
          overflow: "hidden",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 26%), radial-gradient(circle at bottom left, rgba(255,255,255,0.14), transparent 28%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: -80,
            top: -80,
            width: 320,
            height: 320,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.10)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -40,
            bottom: -40,
            width: 300,
            height: 300,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.12)",
            filter: "blur(36px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                borderRadius: 9999,
                padding: "10px 18px",
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.10)",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {brand.name}
            </div>

            <div
              style={{
                display: "flex",
                borderRadius: 9999,
                padding: "12px 20px",
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(8,17,31,0.22)",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {priceLabel}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {[category, level, language, access].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    borderRadius: 9999,
                    padding: "10px 18px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.10)",
                    fontSize: 22,
                    fontWeight: 600,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div
              style={{
                fontSize: 62,
                lineHeight: 1.05,
                fontWeight: 800,
                maxWidth: 900,
                letterSpacing: "-0.04em",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 28,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.84)",
                maxWidth: 860,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              fontSize: 22,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: "white",
                  marginTop: 8,
                }}
              />
              Премиальная страница курса
            </div>

            <div
              style={{
                display: "flex",
                borderRadius: 9999,
                padding: "10px 18px",
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.10)",
                fontWeight: 600,
              }}
            >
              {brand.name}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
