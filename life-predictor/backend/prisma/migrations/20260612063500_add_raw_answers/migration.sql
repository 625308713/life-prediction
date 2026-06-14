-- Store the full questionnaire payload so v2 answers are no longer discarded.
ALTER TABLE "Prediction" ADD COLUMN "rawAnswers" JSONB;
