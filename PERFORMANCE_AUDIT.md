# 4P Education Performance Audit

Дата аудита: 2026-08-23  
Production URL: `https://4pupils.vercel.app`  
Измеряемая сборка: локальный `next build` + `next start`, mobile Lighthouse throttling, одинаковое окружение до и после изменений.

## Executive summary

Client repo — одно Next.js App Router приложение, не monorepo. Используются npm (`package-lock.json` v3), Node.js 23.9.0, Next.js 16.1.6, React 19.2.3 и TypeScript. Backend находится в соседнем `web-server`; frontend обращается к нему через `BACKEND_URL` и Next route handlers. Первый этап ниже был client-only, затем добавлен полный cross-stack аудит.

Основные задержки были вызваны не одной библиотекой, а несколькими измеренными проблемами:

- `/guides` до взаимодействия prefetch-ил тяжёлую detail-страницу, а браузер загружал исходные PNG до 5.4 MiB. Маршрут передавал 12.58 MiB и имел LCP 23.55 s.
- `/o` автоматически загружал 1080p60 `promo.mp4`: 6.44 MiB transfer в Lighthouse и 10.7 MiB на диске. Это происходило несмотря на `preload="metadata"`, потому что видео было `autoplay`.
- root layout делал всё приложение потомком client-side `AuthProvider` и `Toaster`. Каждая публичная страница гидратировала auth-код и выполняла `/api/auth/me`; два Geist font-файла также preload-ились, хотя CSS variables нигде не использовались.
- `/courses`, auth и `/platform/*` зависели от mount-time client fetch/auth gate. Auth pages делали server `getMe`, а затем ещё один client `/me`. Protected platform сначала показывал пустой full-page gate.
- platform header загружал весь каталог только для autocomplete и заранее делал до пяти запросов `/api/users/:id` даже при закрытом bell popover.
- inbox выполнял два перекрывающихся списка (40 сообщений + 100 unread) каждые 30 секунд. Пять потребителей browser settings создавали десять одинаковых listeners.
- Atlas обновлял всё дерево chat state на каждый streaming delta и заранее включал необязательные dialog/bottom-sheet chunks.

После адресных исправлений `/guides` улучшился с Lighthouse 75 до 93 и с 12.58 до 0.34 MiB; `/o` — с 7.00 до 0.86 MiB; sign-in — с 87 до 96. Initial client JS уменьшился на всех измеряемых маршрутах. Визуальный дизайн и реальные API-контракты сохранены.

## Baseline

### Архитектура

- App Router находится в `src/app`; Pages Router и middleware отсутствуют.
- Client state построен на React Context/hooks; SWR/TanStack Query не установлены.
- UI: Radix UI, Lucide, Sonner, dnd-kit.
- Анимации: `framer-motion` и `motion`.
- Markdown: `next-mdx-remote`, `remark-gfm`.
- AI: собственный `/api/chat`; тяжёлого browser AI SDK в dependencies нет.
- Route handlers проксируют auth, courses, enrollments, applications, mail и users во внешний backend.
- ORM, schema, migrations и database client в repo отсутствуют.
- Sentry, Vercel Analytics, Speed Insights, `useReportWebVitals` и `instrumentation-client` не найдены.
- `.env.local` присутствует, но его значения не читались и не изменялись.

### Baseline build

- `npm run lint`: PASS, 4 существовавших warning.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS, production compile 9.4 s.
- Test script и test/spec suites отсутствуют.
- До изменений `/courses` был статическим client shell, `/o` — static, guides list — dynamic из-за `searchParams`, guide detail — SSG, platform/dashboard — dynamic.

### Baseline network proof

- `/o`: `promo.mp4` передал 6,750,549 bytes без пользовательского клика.
- `/guides`: Link prefetch подтянул detail RSC и исходные screenshots, включая `screen2.png` 5,616,962 bytes, `screen8.png` 1,451,878 bytes и `screen11.png` 1,096,481 bytes.
- Favicon передавал 181,642 bytes на каждом маршруте.
- Два неиспользуемых Geist font-файла передавали примерно 60 KiB на каждом маршруте.
- Публичные маршруты выполняли `/api/auth/me` после hydration из-за глобального provider.

## Root causes found

### P0/P1

1. Тяжёлый Next Link prefetch с `/guides` плюс raw `<img>` в guide content создавал 12.58 MiB initial transfer и LCP 23.55 s.
2. 1080p60 autoplay video загружался полностью до взаимодействия на `/o`.
3. Глобальная client auth boundary добавляла JS, hydration и `/me` ко всем публичным страницам.
4. `/courses` получал основной каталог только из client effect; protected platform ожидал client auth gate.
5. Auth pages выполняли server auth lookup, затем provider повторял `/me`.
6. Platform header всегда загружал весь public catalog ради максимум шести autocomplete rows.
7. Inbox дублировал list/unread network work и делал четыре poll-request в минуту.
8. User preferences hook создавался пять раз: пять localStorage reads/state trees, пять `storage` и пять custom-event listeners.

### P2

1. Atlas делал React state update на каждый маленький stream chunk.
2. Atlas delete dialog и course bottom sheet находились в eager graph.
3. Platform header содержал постоянные blurred animation loops без reduced-motion branch.
4. Team eyes обновляли React state на каждый `mousemove`.
5. Counters серверно показывали `0`, затем меняли размер/значение после hydration.
6. Backend SSR fetches не имели общего timeout/fallback.
7. В production-коде оставались временный inbox `console.log`, неиспользуемые imports/variables и две текстовые ошибки.

## Critical fixes

- Root layout снова является server-only shell. Auth provider размещён только в auth, dashboard, platform и Atlas boundaries.
- Dashboard/platform получают пользователя один раз server-side и передают `initialUser` в provider. Client `/me` не повторяется; unauthorized platform redirect выполняется до hydration.
- Public catalog для `/o` и `/courses` приходит server-side и кэшируется через ISR/revalidate 300 s. Client fallback остаётся только для недоступного backend или ручного refresh.
- Inline hero использует отдельный 640×360/24 fps H.264 preview 484 KiB и poster 57 KiB. Исходный 1080p файл сохранён для явного fullscreen просмотра.
- Guides используют `next/image`, корректные intrinsic dimensions/sizes, lazy images ниже fold и отключённый prefetch только на доказанно тяжёлых guide links.
- Favicon уменьшен с 177 KiB до 16.6 KiB без визуальной смены логотипа.

## Data fetching fixes

- Добавлен `/api/courses/search`: минимум 2 символа, максимум 8 server results; UI запрашивает 6.
- Header autocomplete использует debounce 300 ms, `AbortController`, race protection, 5-minute result cache и существующий single-flight `clientFetch`.
- Закрытый search/bell popover больше не инициирует catalog/user-directory requests.
- Inbox теперь получает один snapshot `limit=40`; точный unread count приходит из database window count в том же ответе. Polling уменьшен с 30 до 60 s и работает только при visible document.
- Server fetches auth/public courses/backend получили 10–15 s timeout. Enrollment/application loaders локально возвращают пустое состояние при недоступном backend вместо падения всей route tree.
- Существующий `clientFetch` уже имел GET deduplication, 30 s response cache, 20 s timeout и single-flight refresh; он сохранён, а не заменён новой query library.
- Независимые `/platform/lessons` запросы applications/enrollments уже выполнялись через `Promise.all`; последовательный waterfall там не создавался.

## React rendering fixes

- Один `StudentPlatformPreferencesProvider` заменил пять независимых hook state/subscription instances.
- Auth contexts и toaster больше не перерисовывают публичное дерево.
- Inbox state остаётся в отдельном platform provider; изменение inbox не затрагивает root/public app.
- Atlas streaming deltas буферизуются и применяются не чаще одного раза в 50 ms.
- `mousemove` eyes ограничен одним update на animation frame и не включается для coarse pointer/reduced motion.
- Counters имеют server-visible semantic value; animated overlay больше не оставляет crawler/первый paint со значением `0` и резервирует правильный размер.

## Bundle fixes

Initial JS рассчитан по уникальным JS chunks из Next client-reference manifest; gzip выполнен локально для тех же файлов.

| Route | Before raw/gzip | After raw/gzip | Chunks before/after |
|---|---:|---:|---:|
| `/o` | 390.6 / 119.6 KiB | 347.4 / 107.9 KiB | 9 / 7 |
| `/courses` | 341.7 / 104.0 KiB | 305.7 / 94.0 KiB | 9 / 8 |
| `/learning-fit` | 144.8 / 45.0 KiB | 100.9 / 32.1 KiB | 7 / 5 |
| `/guides` | 142.0 / 42.7 KiB | 88.9 / 26.7 KiB | 7 / 4 |
| `/workspace/company` | 290.9 / 91.4 KiB | 247.0 / 78.5 KiB | 8 / 6 |
| `/auth/sign-in` | 144.1 / 43.6 KiB | 110.2 / 34.3 KiB | 6 / 5 |
| `/platform` | 456.3 / 143.7 KiB | 422.8 / 134.2 KiB | 13 / 11 |
| `/platform/lessons` | 419.1 / 133.3 KiB | 383.5 / 122.9 KiB | 12 / 10 |
| `/platform/messages` | 437.2 / 138.8 KiB | 401.6 / 128.5 KiB | 13 / 11 |
| `/platform/profile` | 445.0 / 140.9 KiB | 409.5 / 130.6 KiB | 13 / 11 |
| `/platform/settings` | 464.0 / 147.7 KiB | 428.5 / 137.4 KiB | 14 / 12 |
| `/ai/homemade/atlas` | 371.9 / 113.4 KiB | 305.6 / 95.6 KiB | 8 / 7 |

Atlas code was route-specific before the audit and did not leak into `/o` or auth. The useful change was lazy-loading optional Atlas UI and removing global auth/sonner chunks. `locomotive-scroll` appears unused in source, but removing an install-only dependency would not change runtime chunks and was intentionally not mixed into this patch.

`npm run perf:budget` now fails when key route initial JS or critical media regress beyond measured headroom. It can be placed after `npm run build` in CI without another dependency.

## Image/font fixes

- Guide list cover: raw `screen11.png` 1.07 MiB transfer became a responsive optimized image around 19 KiB in the measured mobile viewport.
- Guide detail screenshots now have correct width/height and responsive `/_next/image` sources. Measured detail transfer is 0.38 MiB instead of downloading all 13 MiB source PNG files.
- Only the first visible guide cover is priority; images below fold are lazy.
- Guide links in the long/heavy guide surfaces use `prefetch={false}`; global prefetch behavior is unchanged.
- Unused Geist preload/config was removed. The project was not actually applying its variables, so typography rendered with the existing CSS fallback before and after.
- `prefers-reduced-motion` now stops nonessential transitions/loops globally for users requesting it; normal animation behavior remains.

## Backend/database fixes

На первом client-only этапе этот repository действительно не содержал ORM/SQL. В последующем full-stack этапе соседний `web-server` был проаудирован отдельно; результаты query/index проверки находятся в его `PERFORMANCE_SERVER_AUDIT.md` и в дополнении ниже.

Verified frontend/backend behavior:

- Private SSR fetches always use `cache: "no-store"` and forward request cookies.
- Public courses use revalidation 300 s and are never mixed with private user data.
- Mail supports `limit`/`offset`; platform snapshot is bounded at 40 rows and carries an exact database unread count.
- Public courses now use bounded pagination (default 12, max 50) with `hasMore`/`nextOffset`.
- Mailbox rows now carry a compact sender projection, so list rendering no longer calls `/api/users/:id` per sender.

## Route-by-route findings

| Route | Rendering/data path after fixes | Remaining note |
|---|---|---|
| `/o` | Static ISR 5 m; guides from filesystem; public courses server snapshot | Autoplay preview is now 484 KiB; full 1080p loads only in fullscreen DOM |
| `/courses` | Static ISR 5 m with initial 12-course page; further pages load on demand | Offset pagination can migrate to cursor at large cardinality |
| `/learning-fit` | Static; wizard interaction local | Results page may request cached public catalog when recommendations render |
| `/guides` | Dynamic only because category comes from `searchParams`; content from filesystem | No backend request or heavy detail prefetch |
| `/guides/students-platform-guide` | SSG MDX; responsive/lazy images | Source PNGs remain large on disk but are not sent raw in initial navigation |
| `/workspace/company` | Static marketing page | Main remaining cost is page-specific motion/UI JS |
| `/auth/sign-in`, `/auth/sign-up` | Server `getMe` once; client form starts immediately with known anonymous state | Private session is `no-store`; no shared cache |
| `/platform` | Server auth + server enrollments; platform shell remains interactive island | Authenticated Lighthouse needs an existing test session |
| `/platform/lessons` | Server auth; applications and enrollments in parallel | Empty safe state on backend timeout |
| `/platform/messages` | Shared bounded inbox snapshot with inline sender and DB unread count; detail on selection | Authenticated field metrics still require a test session |
| `/platform/profile`, `/platform/settings` | Server auth with shared initial user/preferences provider | localStorage settings hydrate once per platform shell |
| `/ai/homemade/atlas` | Route-only client app; optional auth; chat request only on submit | History remains localStorage; streaming state updates batched to 50 ms |

## Before / After measurements

Lighthouse 13.4.1, mobile emulation/CPU/network throttling, local production server. These are single-run lab values, so small TBT/score movements are noise; transfer/request and multi-second LCP changes are the strongest evidence.

| Route | Score | FCP s | LCP s | TBT ms | CLS | Transfer MiB | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/o` | 92 → 93 | 1.36 → 1.05 | 3.37 → 3.19 | 39 → 17 | 0.000 → 0.000 | 7.00 → 0.86 | 32 → 24 |
| `/courses` | 93 → 95 | 1.21 → 1.05 | 3.16 → 2.91 | 3 → 18 | 0.022 → 0.000 | 0.51 → 0.28 | 28 → 21 |
| `/learning-fit` | 95 → 97 | 1.21 → 1.06 | 2.91 → 2.53 | 3 → 2 | 0.016 → 0.016 | 0.59 → 0.37 | 40 → 34 |
| `/guides` | 75 → 93 | 1.20 → 1.06 | 23.55 → 3.24 | 6 → 0 | 0.000 → 0.000 | 12.58 → 0.34 | 49 → 27 |
| `/workspace/company` | 79 → 88 | 1.35 → 1.06 | 5.55 → 3.99 | 6 → 8 | 0.000 → 0.000 | 0.65 → 0.43 | 41 → 35 |
| `/auth/sign-in` | 87 → 96 | 1.20 → 1.06 | 4.05 → 2.83 | 19 → 0 | 0.000 → 0.000 | 0.59 → 0.37 | 42 → 36 |
| `/platform` unauth redirect | 83 → 91 | 1.20 → 1.21 | 4.73 → 2.55 | 5 → 8 | 0.000 → 0.000 | 0.67 → 0.37 | 50 → 38 |

Additional after-only measurement for `/guides/students-platform-guide`: score 97, FCP 1.06 s, LCP 2.54 s, TBT 5 ms, CLS 0, transfer 0.38 MiB, 27 requests.

The `/platform` lab run is explicitly the unauthorized flow and ends at `/auth/sign-in?next=/platform`. No seed/demo credentials exist in the repo, and none were invented. Authenticated platform, lessons, messages, profile and settings were therefore audited at code/build level.

## Performance budgets

Current CI-ready limits are implemented by `scripts/check-performance-budget.mjs`:

- Public initial JS gzip: `/guides` 32 KiB, `/learning-fit` 38 KiB, sign-in 40 KiB, `/courses` 100 KiB, `/o` 112 KiB.
- Internal initial JS gzip: Atlas 105 KiB, platform 140 KiB.
- Favicon 32 KiB, hero poster 100 KiB, autoplay preview 800 KiB.
- Lighthouse review targets: LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms, no public `/me`, no raw multi-MiB image/video before interaction.
- Network review targets: ordinary public pages ≤ 40 requests and ≤ 600 KiB transfer excluding intentional preview media; `/o` ≤ 1 MiB total.

## Files changed

### Rendering/auth boundaries

- `src/app/layout.tsx` — removed global client auth/toaster and unused fonts.
- `src/app/auth/layout.tsx` — scoped anonymous auth provider.
- `src/app/platform/layout.tsx` — server auth/role redirect and initial user.
- `src/app/dashboard/layout.tsx` — server auth and dashboard-only toaster.
- `src/app/ai/homemade/atlas/layout.tsx` — Atlas-only optional auth provider.
- `src/context/auth-context.tsx`, `src/lib/me.ts` — initial session hydration, deduplicated/timeout-safe server lookup.

### Catalog/search/data flow

- `src/app/o/page.tsx`, `src/app/courses/layout.tsx` — server catalog snapshot and 5-minute ISR.
- `src/lib/public-course.ts`, `src/services/course.ts`, `src/hooks/use-approved-courses.ts` — server cache plus primed client fallback.
- `src/lib/course-search.ts`, `src/app/api/courses/search/route.ts`, `src/hooks/use-course-search.ts` — bounded/debounced/cancelable autocomplete.
- `src/components/dash/layout/user-dash-header.tsx` — removed eager full catalog and closed-popover user lookups.
- `src/lib/backend.ts`, `src/lib/enrollment-server.ts`, `src/lib/course-application-server.ts` — timeout and local failure fallback.

### Platform runtime

- `src/context/student-inbox-context.tsx` — one bounded snapshot and slower visible-only poll.
- `src/hooks/use-student-platform-preferences.ts`, `src/components/dash/layout/user-dash-shell.tsx` — one provider/subscription tree.

### Guides/media/content

- `src/components/cards/guide-card.tsx`, `src/components/sections/guides-section.tsx`, `src/app/guides/[slug]/page.tsx`, `src/components/ui/guide-sidebar.tsx`, `src/components/docs/layout/header-guides.tsx` — optimized images and targeted prefetch.
- `src/components/sections/hero-video.tsx`, `public/videos/promo-preview.mp4`, `public/images/hero-poster.jpg` — lightweight inline media; original fullscreen video retained.
- `src/app/favicon.ico` — equivalent 64×64 optimized icon.
- `src/components/sections/count-down.tsx`, `src/components/motion-primitives/animated-number.tsx` — SSR counter fallback without shift.
- `src/components/sections/faq-section.tsx` — corrected legacy `Efferd` copy.

### Atlas/motion/cleanup

- `src/components/chat/AtlasChat.tsx`, `src/components/chat/AtlasIntroResponse.tsx` — batched stream updates and lazy optional panels.
- `src/components/team/Ready.tsx`, `src/app/globals.css` — throttled listener and reduced motion.
- `src/app/dashboard/admin/inbox/favorites/page.tsx`, `src/components/learning-fit/learning-fit-wizard.tsx`, `src/components/courses/course-contact-fab.tsx`, `src/components/courses/course-application-form-page.tsx`, `src/motion/index.ts` — removed debug/unused code.
- `scripts/check-performance-budget.mjs`, `package.json` — repeatable budget check.

## Remaining risks

1. Authenticated production performance is not lab-measured because no test/seed credentials exist. Validate all five platform routes with a real non-production student session before release.
2. Public course cache is process-local in Express and Next cache invalidation is TTL-based. Multi-replica deployment needs shared invalidation if up to 60–300 s public staleness is unacceptable.
3. Public courses now use bounded offset pagination and compact server search. At large cardinality, replace deep offsets with a `(published_at, course_id)` cursor.
4. Original guide PNGs (up to 5.4 MiB), `public/ochi/team.jpg` (5.9 MiB) and fullscreen `promo.mp4` (10.7 MiB) remain large source assets. Current routes use optimized delivery or explicit interaction, but a CDN/pre-generated AVIF/WebP and adaptive fullscreen video would reduce cold optimizer/storage cost.
5. `/o`, `/courses`, `/guides`, company and sign-in still have lab LCP above 2.5 s in at least one run. The largest regressions are fixed; next iteration should use production field attribution before altering more UX.
6. No automated unit/integration/e2e tests exist. Build, typecheck, lint, Lighthouse and HTTP smoke checks cover this patch, not all business behavior.

## Recommended Vercel monitoring

- Enable Vercel Speed Insights or the existing platform-level equivalent once, not alongside a duplicate analytics stack.
- Track p75 LCP/INP/CLS by route and device, especially `/o`, `/guides`, `/courses` and authenticated `/platform/*`.
- Track function duration/error rate separately for `/api/auth/me`, `/api/courses/public`, `/api/mail`, `/api/users/:id`, enrollments and `/api/chat` streaming.
- Alert on public course response size, mail snapshot latency, 429/5xx rate and repeated `/me`/user-directory request counts per navigation.
- Run `npm run build && npm run perf:budget` in CI; run a small mobile Lighthouse set against Preview deployments. Do not use Lighthouse score alone as a release gate—gate budgets and severe LCP/CLS regressions.

## Verification

- `npm run lint`: PASS, zero warnings.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS, all 67 static pages generated.
- `npm run perf:budget`: PASS for all eight route budgets and three critical assets.
- Tests: NOT AVAILABLE — no test script or test/spec suite in repository.
- Public routes returned expected production HTML; `/o` and `/courses` expose ISR headers, guide detail contains responsive/lazy image markup, and unauthenticated `/platform` redirects server-side to sign-in.
- Lighthouse reports are stored outside the repository under `/tmp/4p-lighthouse-before-*.json` and `/tmp/4p-lighthouse-after2-*.json`; final `/o` is `/tmp/4p-lighthouse-after3-o.json`. No build reports, screenshots, credentials or temporary artifacts were added to git.

## Full-stack optimization phase

Этот этап продолжает и сохраняет client performance refactor выше. В scope добавлен соседний `web-server`, а измеряемый путь расширен до Browser → Next route/server component → Express → PostgreSQL → React. Полный server/query отчёт: `../web-server/PERFORMANCE_SERVER_AUDIT.md`.

### Architecture

- Next 16 App Router выполняет три роли: static/ISR rendering, private server auth gate и BFF route handlers.
- Express 5 разделён на routes/controllers/models; модели выполняют parameterized SQL через один общий `pg.Pool`.
- PostgreSQL находится в удалённом Neon endpoint. На текущих 6 course rows SQL исполняется примерно за 0.1 ms, но обычный DB round-trip занимает около 100–170 ms и может быть значительно выше cold.
- React state остаётся на Context/hooks без добавления новой query library. Existing single-flight/memory cache повторно используется, а public catalog pagination добавлена в тот же service/hook.
- Public и private data paths разведены: public courses могут кэшироваться; auth/users/mail/enrollments/applications всегда `private, no-store`.
- Cloudinary участвует только в course image mutations. Atlas/OpenRouter streaming остаётся внутри Next и не буферизуется Express.

### Client/server request map

| Feature / page | Browser / Next call | Express endpoint | Controller → model/query | Response consumer |
|---|---|---|---|---|
| `/o`, `/courses` initial | server `getPublicCoursesPage`, ISR 300 s | `GET /api/courses/public?limit=12&offset=0` | `listPublic` → bounded `CoursesModel.listPublic` | primed `ApprovedCoursesProvider` |
| Catalog load more | `GET /api/courses/public?limit=12&offset=N` | same | `limit + 1`, derives `hasMore/nextOffset` | `useApprovedCourses`, id-deduped merge |
| Header search | debounced/cancelable `GET /api/courses/search?q=…` | `GET /api/courses/public?q=…&view=search` | DB FTS/trigram relevance + compact projection | maximum 6 search items |
| Course detail/OG/apply | server/BFF public slug read | `GET /api/courses/public/:slug` | `getPublicBySlug` | server page/metadata/image/application |
| Platform shell | server `getMe`, `cache: no-store` | `GET /api/auth/me` | JWT/auth + safe user read | `AuthProvider(initialUser)` |
| Profile save | `PATCH /api/users/me` | `PATCH /api/users/me` | safe-column UPDATE | local AuthContext update, no follow-up `/me` |
| Messages snapshot | `GET /api/mail?folder=inbox&limit=40` | `GET /api/mail` | mailbox/mail/users JOIN + unread window count | shared inbox context/header/messages |
| Mail detail | `GET /api/mail/:id` | same | one SQL with recipients/attachments JSON | selected message |
| Send mail | `POST /api/mail/:id/send` | same | transaction + set-based recipient mailbox insert | compose/send flow |
| Lessons | server applications + enrollments in `Promise.all` | private application/enrollment endpoints | indexed per-user queries | lessons page |
| Atlas | `POST /api/chat`, streaming | not routed through Express | Next OpenRouter stream | 50 ms buffered React updates |

### Server bottlenecks found

1. Public list/search always paid remote DB RTT despite immutable-for-short-window content.
2. Next public catalog BFF used `no-store`, so even an Express cache hit still required a configured backend network hop.
3. Mail list forced the browser to fetch each unique sender separately; unread count used only the first 100 rows.
4. Mail send inserted recipient mailboxes in a sequential loop; detail used three sequential SELECT calls.
5. Auth register/login, application validation and manual enrollment validation serialized independent database operations.
6. Course owner actions fetched the same course once for permission and again for work.
7. Full request headers/query/cookies were eligible for pino serialization on every request, including high-rate cache hits.
8. Client profile PATCH used admin-style `/api/users/:id`, then repeated `/api/auth/me`.

### Database/query issues

- `EXPLAIN (ANALYZE, BUFFERS)` for catalog and search measured about 0.115/0.112 ms. Sequential scan is correct for six rows; adding indexes based only on syntax would not improve the measured bottleneck.
- Existing schema already has public storefront partial/composite indexes, course FTS/trigram GIN, mailbox folder/date/unread indexes, and enrollment/application indexes.
- Search previously filtered only the first cached catalog page in JavaScript. It now executes database FTS/trigram predicates and relevance ordering.
- Inbox sender, unread count and mail detail were query-shape problems, fixed with JOIN/window/JSON subqueries.
- `sendMail` recipient work is now set-based, eliminating O(recipients) SQL calls.
- User client-facing reads/updates project safe columns instead of transporting `password_hash` through `SELECT *`/`RETURNING *`.
- No migration/index change was committed because measured plans and existing indexes did not justify one.

### Cross-layer optimizations

- Catalog initial response is capped at 12, exposes pagination meta, and has a functional “Показать ещё” UI.
- Search travels through Next to a compact database query instead of scanning a cached first page.
- Express public cache is bounded (100 keys), TTL 60 s, LRU-refreshed and protected by single-flight/versioned invalidation.
- Next public list/search/detail fetches revalidate for 60 s, removing repeated Next→Express latency; page ISR remains 300 s.
- Public response carries cache policy and `Server-Timing`; private Express and Next responses use `private, no-store`.
- Mail list embeds sender; student/admin list consumers no longer hydrate a users directory per row.
- Exact unread count comes from SQL in the same bounded list request.
- Profile PATCH updates AuthContext from its response, eliminating one network and database request.
- Server-only public loaders were separated from pure course helpers after production build caught an Edge/Client module-boundary violation.
- Auth/private proxy calls have 10–15 s timeout and request cancellation; public failures keep existing fallback behavior.

### Request count before / after

Counts are per one user action/navigation; `U` is the number of unique senders and `R` the number of recipients.

| Flow | Before | After |
|---|---:|---:|
| Public `/o` or `/courses` initial catalog | 1 bounded-by-backend-default response treated as complete | 1 explicit page of 12; further request only on “Показать ещё” |
| Header search | 1 BFF request scanning cached first page | 1 compact BFF/server search; correct full search scope |
| Inbox snapshot + sender names | 1 list + up to `U` user requests | 1 list request |
| Inbox unread | second list up to 100 rows + client reduce | 0 extra; exact count in main list |
| Mail detail DB work | 1 browser request / 3 SQL calls | 1 browser request / 1 SQL call |
| Send mail DB recipient work | 1 browser request / `R` inserts | 1 browser request / 1 set-based insert |
| Profile save | PATCH + GET `/api/auth/me` | PATCH only |
| Course owner get/update/delete | permission query + duplicate course query | one course lookup reused |
| Login/register post-hash independent writes | 2 sequential DB operations | 2 parallel DB operations |

### Payload reductions

- Search backend payload for the same four rows: 4,699 → 3,065 bytes (−34.8%).
- Search BFF mapping returned 2,244 bytes in the measured query.
- Catalog no longer grows without bound in the first response: default 12, hard max 50.
- `limit=2` page bodies were 2,356 and 2,433 bytes; offset 4 correctly returned an empty page and no next offset.
- Public list itself changed 4,644 → 4,700 bytes in the four-row dataset because useful pagination metadata was added; this +56 byte cost is reported, not hidden.
- User API responses exclude password hashes; mail sender returns only id/name/email/avatar/role.

### Cache strategy

| Layer | Cached | TTL / bound | Invalidation / safety |
|---|---|---|---|
| React course service | public page snapshot | 60 s, one in-flight request | explicit client invalidate/refresh |
| Next public BFF/search/detail | public course GET by full URL | 60 s | revalidation; no cookies in cache key |
| Next `/o`, `/courses` | public initial page | ISR 300 s | route revalidation window |
| Express public courses | normalized list/search/detail | 60 s, max 100 keys | course mutations clear local generation/cache |
| Auth/users/mail/admin | nothing shared | N/A | Express + Next `private, no-store` |

Single-flight was load-tested: 20 simultaneous cold identical requests produced 1 MISS and 19 COALESCED responses. The cache is per Express process; cross-replica invalidation remains an infrastructure concern.

### End-to-end latency before / after

Local production Next was exercised both with the existing configured backend and with an explicit localhost Express build connected to the same Neon DB. No browser credentials or private data were used.

| Measurement | Before | After |
|---|---:|---:|
| Express public list warm p50 | 100.5 ms | 1.2 ms hit |
| Express public list warm p95 | 154.2 ms | 1.9 ms hit |
| Next catalog BFF `limit=2&offset=0` warm p50 | 360.4 ms | 1.1 ms |
| Next catalog BFF warm p95 | 520.1 ms | 1.4 ms |
| Full local stack catalog cold miss | N/A | 204.8 ms, DB timing 163.97 ms |
| Full local stack catalog warm | repeated backend hop | p50 1.4 ms, p95 3.2 ms |
| Full local stack compact search warm | first-page JS filter | p50 1.2 ms, p95 1.6 ms |
| Express warm load, 100 requests/concurrency 25 | N/A | p50 1.3 ms, p95 4.7 ms, p99 6.3 ms, 0 errors |

Cold latency was not “optimized away”: process restart measurements ranged from roughly 0.2 s to 0.9 s depending on DB/connect state. The improvement is repeat-read latency and removal of burst amplification. Authenticated LCP/INP remain N/A because no test credentials were supplied; the earlier Lighthouse table remains the visual/client baseline for public routes and unauthenticated redirect.

### Remaining bottlenecks

1. Neon network/cold latency dominates cache misses. Co-locate service/database or use an approved pooling proxy before micro-optimizing 0.1 ms SQL.
2. Express cache/invalidation is process-local, while Next/CDN revalidation is TTL-based; multi-instance strict freshness needs shared invalidation.
3. Offset pagination is bounded but should become cursor pagination when distant pages or high write volume make offsets expensive/unstable.
4. Authenticated platform browser metrics still require a real non-production student/teacher/admin session.
5. The server dataset is too small to validate large-table plans; add `pg_stat_statements`, endpoint traces and representative load before any new index migration.
6. Original multi-MiB source images/fullscreen video remain a storage/cold-optimizer risk even though initial routes no longer transfer them eagerly.
7. The server has no real test/lint/typecheck script. Syntax, read-only DB probes, HTTP/load smoke and the client build cover this patch, not every business transition.
8. A tracked `cookies.txt` exists in the server repo. Its contents were not read; remediation/history cleanup and credential rotation need a separate explicitly authorized security task.
9. `/courses` category/level/price filters operate over pages already loaded into React. With a large catalog, move those filters into the paginated server query so an unloaded matching course is not hidden until “Показать ещё”.

Final full-stack verification:

- `npm run lint`: PASS, zero warnings.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS, 67-page generation completed in the normal `.env.local` configuration.
- `npm run perf:budget`: PASS. Final gzip: `/o` 108.3 KiB, `/courses` 94.6 KiB, `/learning-fit` 32.1 KiB, `/guides` 26.7 KiB, company 78.5 KiB, sign-in 34.3 KiB, platform 133.8 KiB, Atlas 95.6 KiB. All three asset budgets pass.
- Production HTTP smoke: all public routes returned 200; unauthenticated platform routes returned server redirects to sign-in; public catalog/detail BFF returned 200.
- Private response smoke: auth, mail and users returned `Cache-Control: private, no-store`.
- Pagination smoke: offsets 0/2/4 returned correct counts, `hasMore` and `nextOffset`.
- `git diff --check`: PASS. No commit, deploy, production DB mutation or credential use was performed.
