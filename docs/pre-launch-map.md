# T00 — خريطة المشروع قبل الإطلاق

تاريخ الفحص: 2026-10-22 · الفرع: `pre-launch-fixes` · الخطة: `docs/superpowers/plans/2026-10-22-pre-launch-fixes.md`

## 1. التقنية

| البند | القيمة |
|---|---|
| الإطار | Next.js 16.1.6 — **App Router** (`src/app/[locale]/…`) |
| الترجمة | next-intl 4، توجيه ببادئة `/ar` و`/en`، الرسائل في `src/messages/ar.json` و`en.json` |
| التنسيق | Tailwind v4 (`@theme` في `src/app/globals.css`)، خطوط Thmanyah في `src/fonts/thmanyah` |
| الاختبارات | vitest (`npm test`)، ‏lint ‏(`npm run lint`)، ‏typecheck ‏(`npx tsc --noEmit`) |
| الاستضافة | Render، النشر بدفع `master` |

## 2. مصادر البيانات

كل المحتوى المتغيّر يأتي من **التطبيق الداخلي** (`https://manzel.onrender.com`)، والملفات المحلية بديل فقط عند تعذّر الوصول إليه.

| البيانات | المصدر | البديل عند تعطّل الـAPI | يُعدَّل من |
|---|---|---|---|
| المنتجات والأقسام | `GET /api/public/products`، `/categories` (`src/lib/api.ts`) | لا شيء (قائمة فارغة) | التطبيق |
| صور المنتجات والمشاريع | `img.manzel360.com` (Cloudflare R2) أو `/api/public/…/images` | — | التطبيق |
| مشاريع المعرض | `GET /api/public/website/portfolio` (`src/lib/portfolio.ts`) | `src/data/projects.json` | «الموقع» ← مشاريع المعرض |
| أقسام المعرض الخمسة | ثابتة في `src/data/projects.json` | — | الكود |
| الآراء، الفريق، الخط الزمني، القيم | `GET /api/public/website/content` ← `sections` (`src/lib/siteContent.ts`، `testimonials.ts`، `about.ts`) | `src/data/testimonials.json`، `about.json` + مفاتيح `about.*_N_*` | «الموقع» ← آراء العملاء / صفحة من نحن |
| النصوص التسويقية (90 نصاً) والأرقام `stats.*` | `content.texts` تُدمج فوق ملفات الترجمة | ملفات الترجمة | «الموقع» ← النصوص والعناوين |
| الهاتف، واتساب، البريد، الخرائط، صور الهيرو | `content.site` ← مفاتيح `site.*` | ملفات الترجمة | «الموقع» ← معلومات التواصل / الصور الرئيسية |
| أسعار الحاسبتين | `GET /api/public/calculator-pricing` | `DEFAULT_PRICING` في `src/lib/calculator.ts` | `/admin/calculator-pricing` |
| نموذج التواصل والحجز | `POST /api/public/contact` (الحجز بـ`type: "booking"`) | — | تصل إلى «رسائل التواصل» في التطبيق |

## 3. المكوّنات

| المكوّن في ملف المهام | المسار |
|---|---|
| الصفحة الرئيسية (ترتيب الأقسام + JSON-LD) | `src/app/[locale]/page.tsx` |
| الهيرو | `src/components/home/HomeHero.tsx` + `src/components/HeroVideo.tsx` |
| شريط الأيقونات تحت الهيرو | `src/components/home/QuickAccessBar.tsx` |
| شبكة الخدمات «كل ما يحتاجه منزلك» | `src/components/home/ServicesBento.tsx` (البيانات من `homeData.ts`) |
| قسم التمرير المقيّد (مساحات / بُني بإتقان / حلمك) | `src/components/ScrollVideoSection.tsx` + `src/lib/scrubFrames.ts` + `public/scrub-frames/` |
| العدادات | `src/components/home/CountUp.tsx`، داخل `TrustSection.tsx`؛ القيم من `homeData.ts` و`about/page.tsx` و`portfolio/page.tsx` |
| الآراء | `src/components/home/TrustSection.tsx` + `src/components/TestimonialsCarousel.tsx`، والصفحة `src/app/[locale]/testimonials/page.tsx` |
| الأسئلة الشائعة | `src/components/FAQ.tsx` داخل `home/VisitSection.tsx` |
| الحاسبة | `src/app/[locale]/calculator/page.tsx` + `src/components/Calculator.tsx` + `src/lib/calculator.ts` + `src/components/calc/CalcUI.tsx` |
| الحجز | `src/app/[locale]/booking/page.tsx` + `src/components/BookingForm.tsx` + `CalendarPicker.tsx` |
| من نحن | `src/app/[locale]/about/page.tsx` + `src/components/Timeline.tsx` + `src/lib/about.ts` |
| أعمالنا | `src/app/[locale]/portfolio/page.tsx`، `[category]/page.tsx`، `[category]/[project]/page.tsx`، `src/components/portfolio/ProjectsBrowser.tsx` |
| الكتالوج | `src/app/[locale]/products/page.tsx`، `[id]/page.tsx`، `src/components/products/*`، `src/lib/catalog.ts` |
| الفوتر / الهيدر / القائمة السفلية | `src/components/Footer.tsx`، `SiteHeader.tsx`، `MobileBottomNav.tsx` |
| الميتا العامة | `src/app/[locale]/layout.tsx`، `sitemap.ts`، `robots.ts` |

## 4. ما تُظهره البيانات الحية الآن (من الـAPI، قراءة فقط)

- **الفريق** في قاعدة بيانات التطبيق: «اسم المؤسس»، «اسم المصمم»، «اسم المهندس».
- **الآراء**: الأربعة (أحمد محمد، سارة علي، محمد حسين، فاطمة كريم)، وكلها **في قاعدة البيانات**، لا في الكود فقط.
- **الخط الزمني**: المحطات الست في قاعدة البيانات.
- **H1**: النص المحفوظ في التطبيق لـ`home.hero_subtitle` هو «شريـــكك في البناء والتصميم». التطويل مصدره التطبيق، أما ملف الترجمة فسليم. هذا هو النص الوحيد المُعدَّل حالياً من التطبيق.
- **المعرض**: 5 مشاريع، **كلها في التصميم الداخلي**. اسم أحدها «غرفة أستقبال بيضاء» (`livingroom-white`) في قاعدة البيانات.
- **الأرقام** غير مُعدّلة من التطبيق، فتظهر قيم ملفات الترجمة: ‎+500 / +100 / +10 / +50. أما صفحة أعمالنا فتكتب في الكود أرقاماً **مختلفة**: ‏10+ / 100+ / 150+.
- صورتا `public/testimonials/ahmed.jpg` و`sara.jpg` موجودتان.
- رابط المشروع النموذجي موجود في الكود: `SAMPLE_HOUSE_PATH` في `portfolio/page.tsx`، ويُبنى على `NEXT_PUBLIC_API_URL`.

## 5. أين يختلف ملف المهام عن الكود (وقرارك المعتمد)

| ملف المهام | الواقع | ما سنفعله |
|---|---|---|
| `content/team.ts`، `testimonials.ts`، `timeline.ts`، `stats.ts` | المحتوى يُعدَّل من التطبيق | **يبقى التطبيق هو المصدر.** يختفي القسم الفارغ، وتُفرَّغ البدائل المحلية. **حذف الصفوف البديلة يتم منك من التطبيق.** |
| حقل `verified` للآراء | محرّر الآراء في التطبيق بلا هذا الحقل | الموقع يعرض فقط ما عليه `verified`، **فتختفي الآراء الأربعة فوراً**. إضافة الحقل للتطبيق تُكتب مقترحاً في `docs/internal-app-todo.md`. |
| `lib/calculator/rates.ts` | الأسعار في التطبيق، ونسختها الاحتياطية `DEFAULT_PRICING` في `src/lib/calculator.ts` | لا ملف جديد. الأسعار مجمّعة أصلاً في مصدر واحد، وتُضاف تعليقات المصادر. |
| `content/site.ts` (العلامة، الهاتف، `portalDemoUrl`) | قواعد CLAUDE.md: التواصل من مفاتيح `site.*`، والنصوص من الترجمة | العلامة والتواصل من مفاتيح الترجمة/`site.*`، والأرقام النموذجية والرابط في `src/data/showcase.ts`. |
| T22 «استبدل Organization» | الرئيسية فيها **الاثنان** معاً: `Organization` و`HomeAndConstructionBusiness` (مع `geo`) | دمجهما في كتلة واحدة، وحذف `geo` مع TODO. |
| T13 «أين تذهب البيانات؟» | `POST /api/public/contact` ← «رسائل التواصل» في التطبيق | تبقى الوجهة كما هي. |
| T08 «مسار الفيديو من ملف إعدادات» | صورة الهيرو مفتاح `site.hero_image` من التطبيق، والفيديو ثابت في الكود | مفتاحا `site.hero_video` و`site.hero_poster`، ومقترح لإضافتهما إلى كتالوج التطبيق. |
| T26 البوابة | في مستودع التطبيق | `docs/portal-todo.md` فقط. |

## 6. ما يلزمك فعله في التطبيق (لا كود)

1. «صفحة من نحن»: احذف صفوف الفريق الثلاثة البديلة، وراجع الخط الزمني.
2. «آراء العملاء»: احذف الآراء الأربعة (ستختفي من الموقع على أي حال بعد T04).
3. «النصوص والعناوين» ← «العنوان الكبير»: صحّح «شريـــكك» (الموقع سيقرؤه سليماً بعد T07 على أي حال).
4. «مشاريع المعرض»: صحّح «غرفة أستقبال بيضاء» ← «غرفة استقبال بيضاء».
5. «النصوص والعناوين» ← «الأرقام»: أدخل السنوات والمشاريع والعملاء الحقيقية متى توفرت. ستُفرَّغ في ملفات الترجمة ولن تظهر حتى تُدخلها.
