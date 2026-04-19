export const brand = {
  name: "4Pupils",
  upper: "4PUPILS",
  short: "4P",
  lms: "4Pupils LMS",
  student: "4Pupils Student",
  studentEmail: "student@4pupils.app",
  supportEmail: "hello@4pupils.app",
  storageKeyPrefix: "4pupils",
  description: "The open source learning platform",
  fullDescription:
    "The open source learning platform trusted by millions of educators around the world.",
} as const;

export function withBrandPrefix(value: string) {
  return `${brand.name} | ${value}`;
}

export function replaceLegacyBranding(value: string) {
  return [
    ["hello@frontier.app", brand.supportEmail],
    ["student@frontier.app", brand.studentEmail],
    ["Frontier LMS", brand.lms],
    ["frontier LMS", brand.lms],
    ["FRONTIER", brand.upper],
    ["Frontier", brand.name],
    ["frontier", brand.name],
  ].reduce(
    (result, [legacyValue, nextValue]) =>
      result.replaceAll(legacyValue, nextValue),
    value,
  );
}
