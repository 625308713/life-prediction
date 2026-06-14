# Questionnaire v2 Design

## 1. Why Redesign

The current questionnaire is useful as a prototype, but it mixes high-signal medical predictors, low-signal lifestyle guesses, and broad subjective questions. For a commercial consumer product, the questionnaire should be:

- Short enough for normal users to finish.
- Clear enough that users do not guess randomly.
- Evidence-aligned enough to feel trustworthy.
- Flexible enough to support "I don't know" answers.
- Designed around health-span risk and improvement potential, not deterministic lifespan prediction.

The goal is not to make a medical diagnostic tool. The goal is to produce a better educational risk profile and a more useful action plan.

## 2. Proposed Form Structure

Use a **two-layer questionnaire**:

1. **Core Assessment**
   - Target time: 3-5 minutes.
   - Required for all users.
   - Produces the first LifeScore and basic result card.

2. **Accuracy Boosters**
   - Optional modules.
   - Users can skip or answer "I don't know".
   - Improves confidence and makes the report more specific.

This is better than forcing 11 equal steps. It gives users a quick win first, then invites deeper answers.

## 3. Core Assessment v2

### A. Basic Profile

Purpose: establish baseline risk and normalize ranges.

Questions:

- Age.
- Sex at birth: male, female, prefer not to say.
- Country/region: China, United States, other.
- Height.
- Weight.
- Waist circumference.

Notes:

- Keep BMI auto-calculation.
- Keep waist circumference because central obesity often adds signal beyond BMI.
- Region lets us later adapt baseline life expectancy and units.

### B. Known Health Signals

Purpose: capture the strongest self-reported medical risk inputs without requiring lab literacy.

Questions:

- Have you ever been diagnosed by a clinician with any of these?
  - High blood pressure.
  - Diabetes or prediabetes.
  - Heart disease.
  - Stroke/TIA.
  - Cancer.
  - Chronic kidney disease.
  - Chronic lung disease.
  - None of these.
  - Not sure.
- Blood pressure, if known:
  - Normal.
  - Elevated.
  - Stage 1 high.
  - Stage 2 high.
  - I don't know.
- Blood sugar/A1C, if known:
  - Normal.
  - Prediabetes.
  - Diabetes.
  - I don't know.
- Current long-term medication:
  - None.
  - Blood pressure medicine.
  - Blood sugar medicine.
  - Cholesterol medicine.
  - Other long-term medicine.
  - Prefer not to say.

Notes:

- Add "I don't know" everywhere to avoid false precision.
- Do not ask users to self-diagnose from symptoms.

### C. Movement and Sitting

Purpose: physical activity is one of the clearest modifiable health-span inputs.

Questions:

- In a usual week, how many minutes of moderate activity do you get?
  - 0-30.
  - 31-90.
  - 91-149.
  - 150-300.
  - More than 300.
- Do you do muscle-strengthening exercise at least 2 days per week?
  - Yes.
  - No.
  - Not sure.
- On most days, how many hours do you sit?
  - Under 4.
  - 4-8.
  - More than 8.

Notes:

- WHO recommends at least 150-300 minutes of moderate-intensity aerobic activity per week for adults, or equivalent vigorous activity.
- This is more precise than the current "exercise frequency" question.

### D. Smoking and Alcohol

Purpose: high-signal behavioral risks.

Questions:

- Smoking/vaping status:
  - Never.
  - Quit more than 10 years ago.
  - Quit within 10 years.
  - Currently smoke/vape occasionally.
  - Currently smoke/vape daily.
- If current smoker, approximate daily amount:
  - 1-9 cigarettes/day.
  - 10-19.
  - 20 or more.
  - Not applicable.
- Alcohol pattern:
  - I don't drink.
  - Rare/social.
  - Within moderate limits.
  - Often above moderate limits.
  - Prefer not to say.

Notes:

- CDC states quitting smoking reduces premature death risk and can add as much as 10 years to life expectancy.
- Alcohol should be phrased gently because users underreport.

### E. Sleep and Recovery

Purpose: sleep duration and possible sleep apnea are useful, actionable risk signals.

Questions:

- Average sleep on workdays:
  - Less than 5 hours.
  - 5-6 hours.
  - 7-8 hours.
  - 9+ hours.
- Do you often wake up unrefreshed or sleepy during the day?
  - Yes.
  - No.
  - Not sure.
- Has anyone told you that you snore loudly or stop breathing during sleep?
  - Yes.
  - No.
  - Not sure.

Notes:

- CDC references 7 or more hours as the recommended amount for healthy adults.
- Sleep apnea should be framed as a reason to seek medical advice, not as a diagnosis.

### F. Food Pattern

Purpose: avoid overcomplicated nutrition scoring while capturing broad diet quality.

Questions:

- How many days per week do you eat vegetables or fruit at least twice?
  - 0-2.
  - 3-5.
  - 6-7.
- How often do you eat heavily processed, high-salt, fried, or sugary foods?
  - Rarely.
  - Sometimes.
  - Most days.
- Main eating pattern:
  - Balanced mixed diet.
  - Mostly plant-forward.
  - High meat/high salt/high oil.
  - Irregular meals.

Notes:

- Keep diet simple. Most consumer users cannot accurately estimate nutrients.

### G. Mental, Social, and Purpose

Purpose: capture health-span-relevant psychosocial factors without making the quiz feel like therapy.

Questions:

- In the past month, how often did you feel high stress?
  - Rarely.
  - Sometimes.
  - Often.
- How connected do you feel to friends/family/community?
  - Strongly connected.
  - Somewhat connected.
  - Mostly isolated.
- Do you feel you have a reason or goal that pulls you forward?
  - Yes.
  - Somewhat.
  - No.

Notes:

- Replace the single happiness score with more actionable dimensions.

## 4. Accuracy Boosters

Optional modules should unlock after the core result or at the end of the core quiz.

### Module 1: Lab and Clinical Numbers

- Systolic/diastolic blood pressure exact values.
- A1C or fasting glucose.
- LDL/HDL or total cholesterol.
- Resting heart rate.

### Module 2: Functional Fitness

- VO2max estimate or cardiorespiratory fitness level.
- Grip strength: strong, average, weak, unknown.
- Can climb 3 floors without stopping: yes/no.
- Usual walking pace: slow/average/brisk.

### Module 3: Family and Early-Life Risk

- Parents lived beyond 75.
- Any close relative lived beyond 90.
- Family history of early heart disease, cancer, dementia, diabetes.

### Module 4: Healthcare Access and Prevention

- Last physical checkup.
- Cancer screening age-appropriate status.
- Dental checkup.
- Has a regular doctor/clinic.
- Health insurance/ability to pay for care.

### Module 5: Environment and Safety

- Air pollution exposure or smoking at home.
- High-risk job.
- Long work hours.
- Risky driving or injury-prone behavior.

## 5. Scoring Changes

The score should be separated into three concepts:

- **LifeScore**: consumer-friendly 0-100 score for sharing.
- **Estimated range**: probability-style lifespan/health-span range, shown with disclaimers.
- **Confidence**: how complete and reliable the questionnaire inputs are.

Algorithm changes:

- Strong predictors should carry more weight: age, sex, diagnosed disease, smoking, blood pressure, diabetes, BMI/waist, activity, sleep, functional fitness.
- Low-confidence self-reports should affect confidence more than score.
- "I don't know" should not be treated as healthy or risky; it should reduce confidence.
- Core result should still work with skipped optional modules.
- Optional exact lab values should override broad categories when present.

## 6. UX Changes

Recommended flow:

1. Start screen.
2. Core quiz in 6 short sections.
3. Immediate result card.
4. Prompt: "Improve accuracy with 2-minute boosters."
5. Optional modules.
6. Refined result card.

This creates a better product loop than forcing all questions before any reward.

## 7. Evidence References

- WHO physical activity guidance: adults should do 150-300 minutes of moderate-intensity activity per week, or equivalent vigorous activity.
- CDC BMI categories: adult BMI categories are commonly grouped as underweight, healthy weight, overweight, and obesity.
- American Heart Association blood pressure categories: normal, elevated, stage 1 hypertension, and stage 2 hypertension.
- CDC smoking cessation benefits: quitting reduces premature death risk and can add as much as 10 years to life expectancy.
- CDC sleep guidance: healthy adults are recommended to get 7 or more hours of sleep.
- CDC alcohol guidance: moderate drinking limits are commonly described as up to 2 drinks/day for men or 1 drink/day for women on days alcohol is consumed.
- CDC diabetes testing: A1C and blood sugar tests are used to identify normal, prediabetes, and diabetes ranges.

## 8. Next Implementation Step

Do not patch the old 11-step questionnaire one field at a time. Instead:

1. Add a new questionnaire data model that supports core answers, optional boosters, and unknown values.
2. Build the new 6-section core quiz UI.
3. Map old fields to the new algorithm only where still useful.
4. Update the algorithm to separate LifeScore, estimated range, and confidence.
5. Add a migration path so old database records can still be viewed.

