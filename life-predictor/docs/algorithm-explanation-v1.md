# LifeScore Algorithm Explanation v1

Last updated: 2026-06-12

## Product Boundary

LifeScore is an educational health-span scorecard for normal consumer users. It is not a clinical diagnosis, actuarial underwriting model, medical device, or guarantee of lifespan.

The product should explain results as a priority map:

- Which health signals look protective.
- Which signals deserve attention first.
- How complete the input data is.
- Which small next actions are most likely to improve the user's health profile.

## Output Concepts

The backend currently exposes these concepts:

- `baselineLifeExpectancy`: a sex-based reference point with an age-conditioned guardrail for older adults.
- `adjustedLifeExpectancy`: the point estimate after applying questionnaire adjustments.
- `baseLifeExpectancy`: legacy API/database field name. For compatibility, it still stores the adjusted point estimate.
- `adjustedMin` / `adjustedMax`: uncertainty band around the adjusted point estimate.
- `healthLifespan`: a rough health-span proxy derived from the adjusted point estimate.
- `percentile`: a peer-comparison signal derived from the adjusted point estimate and baseline.
- `totalAdjustment`: the difference between adjusted point estimate and baseline.
- `confidenceLevel`: completeness score, not medical certainty.

Do not use `baseLifeExpectancy` in new copy or product explanations. Use "result estimate", "result range", "LifeScore", or `adjustedLifeExpectancy` internally.

## Inputs

The v2 questionnaire is organized into a short core assessment plus optional accuracy boosters.

Core assessment:

- Basic profile: age, sex, region, height, weight, waist.
- Known health signals: diagnosed conditions, blood pressure, blood sugar, medications.
- Movement and sitting: weekly activity, strength training, sedentary time.
- Smoking and alcohol.
- Sleep and recovery.
- Food pattern.
- Mental, social, and purpose signals.

Accuracy boosters:

- Exact clinical numbers such as blood pressure, A1C, fasting glucose, LDL, resting heart rate.
- Functional fitness such as stair climbing, walking pace, VO2max, grip strength.
- Family longevity and family disease history.
- Prevention and healthcare access.
- Environment and work exposure.

Unknown answers should reduce confidence instead of being treated as healthy answers.

## Scoring Model

Current scoring is a heuristic weighted-additive model:

1. Start with a baseline: male 75, female 80, with an age-conditioned remaining-life guardrail for users 65+.
2. Add or subtract signal weights across health dimensions.
3. Scale adjustments down for older ages, because late-life estimates should move less aggressively than early-adult estimates.
4. Clamp positive adjustment at `+14` and negative adjustment at `-20`.
5. Keep the result range from falling below the user's current age; the point estimate must remain at least one year in the future.
6. Build an uncertainty range of plus/minus 5 years around the adjusted point estimate, after the age guardrail.
7. Rank top risks and strengths by the strongest weighted signals.
8. Estimate potential gain as the absolute weight of the top three risk signals.
9. Derive LifeScore on the frontend from percentile, adjustment, and confidence.

Important: weights are product heuristics inspired by public health guidance and common risk patterns. They are not cohort-calibrated hazard ratios.

## Key Signal Alignment

The questionnaire and thresholds are aligned with public, user-readable health guidance:

- Physical activity: WHO highlights at least 150 minutes of moderate activity per week as a global adult recommendation, and notes that all activity counts and muscle strengthening is broadly beneficial.
- Sleep: CDC lists 7 or more hours for many adults, with age-specific ranges for older adults.
- Blood pressure: American Heart Association categories use normal under 120/80, elevated 120-129 and under 80, stage 1 at 130-139 or 80-89, and stage 2 at 140+ or 90+.
- Blood sugar: CDC diabetes testing ranges use A1C below 5.7% as normal, 5.7-6.4% as prediabetes, and 6.5% or above as diabetes; fasting glucose uses 99 mg/dL or below, 100-125, and 126+.
- Older-adult guardrail: the age-conditioned baseline uses a simplified interpolation inspired by public period life-table remaining-year patterns. It is a product sanity check, not an actuarial pricing table.

References:

- WHO physical activity fact sheet: https://www.who.int/news-room/fact-sheets/detail/physical-activity
- CDC sleep guidance: https://www.cdc.gov/sleep/about/index.html
- American Heart Association blood pressure categories: https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings
- CDC diabetes testing guidance: https://www.cdc.gov/diabetes/testing/index.html
- Social Security period life table: https://www.ssa.gov/oact/STATS/table4c6.html

## Result Archetypes

Result archetypes make the report easier to remember and share. They are assigned from the strongest risk groups:

- Steady Builder: strong overall profile or no dominant high-risk group.
- Movement Unlock: activity, sitting, strength, walking pace, or stair-climb risks dominate.
- Recovery First: sleep, stress, mood, or social connection risks dominate.
- Metabolic Tune-Up: BMI, waist, blood pressure, glucose, LDL, or food-pattern risks dominate.
- Prevention Catch-Up: checkup, screening, access, or known disease follow-up risks dominate.
- Environment Reset: air, secondhand smoke, overwork, high-risk occupation, noise, or safety exposure risks dominate.

Archetypes should guide tone and action priority. They should not imply a medical subtype.

## Known Limitations

- Baselines are not yet region-, cohort-, or ethnicity-calibrated.
- The age-conditioned baseline is a rough guardrail to avoid impossible outputs for older users, not a validated actuarial model.
- Weights are not validated against longitudinal cohort data.
- `baseLifeExpectancy` remains a historical database name for the adjusted point estimate.
- Fasting glucose supports `mg/dL` and `mmol/L`, with normalized `mg/dL` scoring.
- The product does not account for medication control quality, disease severity, pregnancy, disability, rare diseases, or clinician judgment.
- Optional unknown answers improve honesty but can reduce specificity.
- Result ranges are educational uncertainty bands, not statistical confidence intervals.

## Next Algorithm Improvements

1. Add region-aware baselines for China, United States, and other launch markets.
2. Add proper unit handling for cholesterol and any future lab values.
3. Split database fields so baseline and adjusted point estimate are stored separately.
4. Expand the calibration script into a small algorithm test suite with representative profiles and edge cases.
5. Add a user-facing "How LifeScore works" page derived from this document.
6. Collect anonymous aggregate distributions after launch to tune language and confidence, without using sensitive answers for ad targeting.
