export const brand = {
  name: "4P Education",
  upper: "4P",
  short: "4P",
  lms: "4P LMS",
  student: "4P Student",
  studentEmail: "student@4p.app",
  supportEmail: "hello@4p.app",
  storageKeyPrefix: "4p",
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
