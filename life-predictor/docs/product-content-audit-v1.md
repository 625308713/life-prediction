# LifeScore Product Content Audit v1

Last updated: 2026-06-11

## Content Positioning

LifeScore should feel like a lightweight health-span scorecard, not a deterministic life-expectancy predictor.

Preferred language:

- Health-span profile
- LifeScore result card
- Priority risks
- Strengths already working for you
- Next small move
- Educational only, not medical diagnosis

Avoid:

- Guaranteed lifespan language
- "You will gain X years"
- Fear-based conversion copy
- Medical treatment instructions
- Developer-facing wording such as model configuration or ad placeholders

## Changes Made In This Pass

- Unified old "寿命预测 / Life Predictor" copy toward `LifeScore`.
- Replaced `8-12 minutes` with `core 3-5 minutes; boosters optional`.
- Softened potential-gain copy from a deterministic promise to theoretical improvement space.
- Clarified fasting glucose unit in Chinese questionnaire copy: mg/dL only, mmol/L users can skip.
- Kept privacy and medical boundary language visible from home, questionnaire, and result pages.
- Added result archetypes so users receive a memorable type, not only a score.
- Added a visual share card preview and PNG download path for social sharing.
- Added a lightweight "how the score works" explanation on the result page.
- Tightened the home hero around conversion: 6 core steps, 3-5 minutes, skippable labs, privacy trust chips, and a realistic result-card preview.
- Improved quiz retention: each step explains why it matters, and the 6th core step can generate a result immediately or continue to optional boosters.
- Ran a mobile pass for home, core completion, and result pages; reduced mobile hero size, clarified the secondary booster CTA, added step-change scroll reset, and added fallback labels so machine keys do not leak into user-facing result cards.
- Added `docs/algorithm-explanation-v1.md` and clarified the legacy `baseLifeExpectancy` field as an adjusted point-estimate alias.
- Added a public `/how-it-works` page that explains LifeScore concepts, scoring logic, limits, and public health references in Chinese and English.
- Aligned the result page with the public method page: clearer metric notes, four result-reading concepts, softer potential-gain wording, and links to `/how-it-works`.
- Added a share-safe `/share/:id` page backed by `/api/predictions/:id/share`, showing only summary highlights instead of the full result report.
- Added SEO/share-preview foundations: per-page title/description/canonical tags, Open Graph/Twitter tags, `robots.txt`, `sitemap.xml`, and noindex rules for private result pages.
- Added a result-page 7-day challenge card and copyable challenge message so the report converts into one small action and a more shareable prompt.
- Upgraded the public share page with a privacy-safe 7-day challenge card, challenge-copy text, and a stronger "try it yourself" CTA.
- Cleaned legacy product language across README, API errors, AI prompt copy, admin labels, CSV export naming, and server startup text.
- Slimmed the result-page hierarchy: removed the top explanatory reading guide, moved the 7-day challenge directly after the result interpretation, and folded method details into a lower expandable section.
- Reduced questionnaire drop-off around unknown health metrics: added explicit "unknown is okay" guidance, per-field lab-value clearing, a full clinical-number clear action, and safer reset behavior when measured BP/glucose values are removed.
- Added fasting-glucose unit switching between `mg/dL` and `mmol/L`, while keeping normalized `mg/dL` values for the existing scoring logic.
- Added algorithm calibration fixtures for representative user profiles and adjusted the first-pass scoring guardrails: age-conditioned baseline for older adults, lower positive ceiling, stronger heavy-smoking / insufficient-sleep / sleep-apnea signals, and no result range below the user's current age.

## Result Archetypes

- Steady Builder / 稳态建造型: strengths outweigh high-impact risks.
- Movement Unlock / 运动解锁型: activity, sitting, strength, walking pace, or stair-climb risks appear first.
- Recovery First / 恢复优先型: sleep, stress, mood, or social connection risks appear first.
- Metabolic Tune-Up / 代谢调优型: weight, waist, blood pressure, glucose, LDL, or food-pattern risks appear first.
- Prevention Catch-Up / 预防补课型: screening, checkup, access, known disease, or follow-up signals appear first.
- Environment Reset / 环境减压型: air, smoke, work, noise, or behavior-exposure risks appear first.

## Current Product Flow Copy

Home:

- Promise: lightweight health-span profile.
- Time: core 3-5 minutes.
- CTA: start the 6 core steps, not a vague assessment.
- First-screen expectation: users see the result card structure before starting.
- Product path: core quiz -> optional boosters -> result readout -> share card.

Questionnaire:

- Core steps produce a usable result.
- Booster steps improve sharpness but are optional.
- Unknown answers should not be punished as false-healthy data.
- Every step should explain why the question group matters.
- At the end of core step 6, users choose between generating the result now or improving accuracy.

Result:

- First explain how to read the result.
- Explain that LifeScore is a priority map built from health signals, peer comparison, confidence, and action priority.
- Show strengths and priority risks with "why it matters" and "try this first".
- Use share text that includes score, strongest advantage, and first priority.
- Offer a shareable result card image with score, archetype, key signal, strength, and priority risk.

## Remaining Content Work

1. After beta testing, tune the public "how the score works" page with real user questions and add screenshots if needed.
2. Add a lightweight "save/share image" usability pass after testing on mobile browsers.
3. Explore QR code support after the domain and production URL are finalized.
4. Set `PUBLIC_SITE_URL` before production launch so canonical URLs, sitemap entries, and share cards use the final domain.
5. Expand algorithm calibration with more age bands, female-specific examples, and region-specific launch assumptions.

## Health Content Reference Points

- WHO adult physical activity guidance: https://www.who.int/news-room/fact-sheets/detail/physical-activity
- CDC sleep duration guidance: https://www.cdc.gov/sleep/about/index.html
- American Heart Association blood pressure categories: https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings
- CDC diabetes and A1C testing guidance: https://www.cdc.gov/diabetes/testing/index.html
