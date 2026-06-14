# Product Definition v1

## 1. Product Direction

Working name: **LifeScore**

Chinese name: **健康寿命分数**

One-line positioning:

> A lightweight, shareable health-span quiz that helps everyday users understand their longevity strengths, risk habits, and practical room for improvement.

中文定位：

> 一个轻量、有趣、可分享的健康寿命测评工具，帮助普通用户发现自己的长寿优势、风险习惯和可改善空间。

The product should avoid sounding like a medical diagnosis or a fixed death prediction. The main product language should shift from "predict your lifespan" to:

- Health-span score
- Health age
- Longevity profile
- Risk habits
- Improvement potential
- Personalized action plan

Core emotional promise:

> "I can learn something useful about my health in a few minutes, get a result that feels personal, and share it without feeling scared or judged."

## 2. Target Audience and Experience

Primary audience:

- Everyday users, especially 20-45 year old people who are curious about health, aging, habits, and self-improvement.
- Users should not need medical knowledge to complete the quiz.
- The product should feel lighter than a hospital form, but more trustworthy than a random viral test.

Product personality:

- Light, warm, clear, and slightly playful.
- Data-informed but not overly clinical.
- Encouraging rather than fatalistic.
- Easy to share on social media or in private chats.

Language support:

- Chinese and English only.
- Language switch should be available on public pages, quiz pages, result pages, and legal pages.
- Chinese can be the default language for the first launch, with English as a complete parallel experience.

## 3. MVP Product Scope

First commercial MVP pages:

- Home: explains the quiz quickly and invites users to start.
- Assessment: multi-step quiz with clear progress and lighter wording.
- Result: personalized health-span score, strengths, risks, improvement plan, and AI report.
- Share page: a cleaner public result variant that hides sensitive raw data and encourages others to take the quiz.
- About: explains what LifeScore is and is not.
- Privacy Policy: required for trust and later ads.
- Disclaimer: clearly states this is educational and not medical advice.
- Contact: simple contact route for feedback, business, and policy questions.
- Admin: internal dashboard for submissions and trends.

MVP result page should include:

- Health-span score or LifeScore.
- Estimated range, framed as a probability-based wellness estimate.
- Top 3 strengths.
- Top 3 risk habits.
- Improvement potential.
- Personalized 7-day or 30-day action plan.
- Shareable visual summary.
- Clear disclaimer near the result.

Not included in v1:

- Paid reports.
- User accounts.
- Medical diagnosis.
- Doctor matching.
- Insurance recommendations.
- Aggressive ad placements.
- Complex gamification or leaderboards.

## 4. Monetization and Ads Strategy

Early monetization default: **traffic first, ads later**.

Stage 1:

- Do not show real ads in the first product rebuild.
- Add tasteful ad-slot placeholders in the layout only where they will not hurt trust.
- Focus on useful content, shareability, SEO basics, and product quality.

Stage 2:

- After the site has complete public pages and original content, apply for AdSense.
- Google AdSense eligibility requires original content that complies with policy, site source access, and an applicant who is at least 18 years old. Reference: [AdSense eligibility requirements](https://support.google.com/adsense/answer/9724).
- Privacy policy must disclose advertising cookies and personalized advertising opt-out options before real Google ads are used. Reference: [AdSense required content](https://support.google.com/adsense/answer/1348695).

Stage 3:

- Add real ads conservatively:
  - one below-result ad slot,
  - one content-page inline ad slot,
  - optional footer or sidebar ad on desktop only.
- Avoid ads inside sensitive result summaries or before users see their core result.

Policy guardrails:

- Avoid harmful or misleading health claims.
- Avoid saying the result is a diagnosis, guarantee, or certain prediction.
- Avoid fear-based copy.
- Google Publisher Policies restrict misleading content and harmful health claims. Reference: [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/10502938).

## 5. First Implementation Roadmap

### Phase 0: Stabilize the current app

Goal: make the existing project reliably build, run, and deploy.

Tasks:

- Reinstall/fix frontend and backend dependencies.
- Verify production static asset path so the backend serves the Vite build correctly.
- Keep Railway/Docker build output aligned with the Vite output directory.
- Fix AI API documentation and defaults so OpenAI-compatible endpoints are not confused with native Anthropic endpoints.
- Fix result refresh/share behavior so `percentile` and `totalAdjustment` are returned from the backend instead of being hardcoded.
- Clarify `baseLifeExpectancy` semantics where it actually means adjusted predicted life expectancy; keep it as a legacy alias until a database migration splits baseline and adjusted estimate fields.
- Add basic smoke checks for public API, result fetch, and frontend build.

Acceptance criteria:

- Backend builds successfully.
- Frontend builds successfully.
- Production build serves the frontend and API from one deployed service.
- A user can submit a quiz, open the result, refresh it, and see consistent values.

### Phase 1: Product and visual redesign

Goal: turn the app from a form demo into a polished consumer quiz.

Tasks:

- Rework home page copy and layout around LifeScore / health-span score.
- Make the quiz feel shorter and friendlier without removing important data.
- Add result-page sections for score, strengths, risks, improvement plan, and sharing.
- Add a share-friendly result mode that avoids exposing sensitive details.
- Update Chinese and English text together.

Acceptance criteria:

- First screen explains the value within 5 seconds.
- Quiz feels approachable on mobile.
- Result page is visually shareable and not fear-inducing.
- Both languages are complete enough for launch.

### Phase 2: Trust, policy, and SEO foundation

Goal: prepare the product for public launch and future ads.

Tasks:

- Add About, Privacy Policy, Disclaimer, and Contact pages.
- Add SEO metadata, Open Graph, Twitter Card metadata, and canonical URL handling.
- Add structured data where appropriate.
- Add sitemap and robots.txt.
- Add visible disclaimers in result and footer.
- Add analytics event plan without collecting unnecessary sensitive data.

Acceptance criteria:

- Public pages make the product look legitimate.
- Privacy and disclaimer pages are accessible from the footer.
- Link previews look good when shared.
- SEO basics are in place for Chinese and English pages.

### Phase 3: Launch instrumentation

Goal: understand usage and failures after launch.

Tasks:

- Add lightweight analytics events:
  - start quiz,
  - complete quiz,
  - view result,
  - share result,
  - language switch,
  - contact click.
- Add error monitoring after deciding the Sentry project details.
- Add admin dashboard improvements for traffic and conversion funnel.
- Run accessibility, SEO, and web quality audits before launch.

Acceptance criteria:

- We can see whether users start, finish, and share.
- Runtime errors are visible.
- Launch checklist can be repeated before each release.

## 6. Design Principles

- The first screen should be the actual product invitation, not a generic SaaS landing page.
- Cards should be used for quiz/result modules, not nested inside other cards.
- Mobile layout comes first.
- Use visual hierarchy, icons, progress, and result badges to make the experience feel rewarding.
- Avoid scary "death clock" framing.
- Avoid pretending precision that the model cannot support.
- Use ad space sparingly and never let ads interrupt the main result.

## 7. Next Concrete Step

Start with **Phase 0: Stabilize the current app**.

The first code task should be:

> Fix build/deploy reliability and result consistency before redesigning the UI.

Recommended order:

1. Reinstall dependencies and confirm both builds.
2. Verify Vite build serving path for Docker/Railway.
3. Return `percentile` and `totalAdjustment` from the prediction detail endpoint.
4. Correct AI endpoint defaults/docs.
5. Add minimal smoke tests or build checks.
