-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "waistCm" DOUBLE PRECISION NOT NULL,
    "ethnicity" TEXT NOT NULL DEFAULT 'east_asian',
    "chronicDiseases" TEXT[],
    "cancerHistory" BOOLEAN NOT NULL DEFAULT false,
    "bloodPressure" TEXT NOT NULL,
    "bloodSugar" TEXT NOT NULL,
    "cholesterolLevel" TEXT,
    "regularCheckup" BOOLEAN NOT NULL DEFAULT false,
    "currentMedications" TEXT[],
    "parentLongevity" TEXT NOT NULL,
    "familyMemberAbove90" BOOLEAN NOT NULL DEFAULT false,
    "familyAlzheimers" BOOLEAN NOT NULL DEFAULT false,
    "familyParkinsons" BOOLEAN NOT NULL DEFAULT false,
    "familyHeartDisease" BOOLEAN NOT NULL DEFAULT false,
    "familyCancer" BOOLEAN NOT NULL DEFAULT false,
    "smokingStatus" TEXT NOT NULL,
    "alcoholConsumption" TEXT NOT NULL,
    "exerciseFrequency" TEXT NOT NULL,
    "sedentaryHours" TEXT NOT NULL,
    "dietPattern" TEXT NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "waterIntake" TEXT,
    "happinessScore" INTEGER NOT NULL,
    "chronicStress" BOOLEAN NOT NULL DEFAULT false,
    "depressionTendency" BOOLEAN NOT NULL DEFAULT false,
    "stablePartner" BOOLEAN NOT NULL DEFAULT false,
    "socialActivity" TEXT NOT NULL,
    "senseOfPurpose" BOOLEAN NOT NULL DEFAULT false,
    "educationLevel" TEXT,
    "highRiskOccupation" BOOLEAN NOT NULL DEFAULT false,
    "weeklyWorkHours" INTEGER,
    "longTermNoise" BOOLEAN NOT NULL DEFAULT false,
    "incomeLevel" TEXT,
    "selfDisciplineScore" INTEGER,
    "positiveAgingAttitude" BOOLEAN DEFAULT false,
    "readingHabit" BOOLEAN DEFAULT false,
    "highRiskBehaviors" BOOLEAN DEFAULT false,
    "bedtimeRange" TEXT,
    "untreatedSleepApnea" BOOLEAN DEFAULT false,
    "moderateNapping" BOOLEAN DEFAULT false,
    "preSleepScreenTime" BOOLEAN DEFAULT false,
    "frequentIllness" BOOLEAN DEFAULT false,
    "autoimmuneDisease" BOOLEAN DEFAULT false,
    "chronicInflammation" BOOLEAN DEFAULT false,
    "distanceToHospital" TEXT,
    "commercialInsurance" BOOLEAN DEFAULT false,
    "recentCheckupCount" INTEGER,
    "hasFamilyDoctor" BOOLEAN DEFAULT false,
    "restingHeartRate" INTEGER,
    "vo2maxLevel" TEXT,
    "gripStrength" TEXT,
    "unintendedWeightLoss" BOOLEAN DEFAULT false,
    "baseLifeExpectancy" DOUBLE PRECISION NOT NULL,
    "adjustedMin" DOUBLE PRECISION NOT NULL,
    "adjustedMax" DOUBLE PRECISION NOT NULL,
    "healthLifespan" DOUBLE PRECISION NOT NULL,
    "dimensionScores" JSONB NOT NULL,
    "topRisks" TEXT[],
    "topStrengths" TEXT[],
    "potentialGain" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "aiReport" TEXT,
    "aiReportGeneratedAt" TIMESTAMP(3),

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prediction_createdAt_idx" ON "Prediction"("createdAt");

-- CreateIndex
CREATE INDEX "Prediction_gender_idx" ON "Prediction"("gender");

-- CreateIndex
CREATE INDEX "Prediction_age_idx" ON "Prediction"("age");

-- CreateIndex
CREATE INDEX "Prediction_baseLifeExpectancy_idx" ON "Prediction"("baseLifeExpectancy");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_token_key" ON "AdminSession"("token");
