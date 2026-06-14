-- Leads captured on the result page (lead magnet / retest reminders).
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "predictionId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'result_unlock',
    "language" TEXT NOT NULL DEFAULT 'zh',

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lead_email_predictionId_key" ON "Lead"("email", "predictionId");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- First-party funnel events.
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "predictionId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Event_type_createdAt_idx" ON "Event"("type", "createdAt");
