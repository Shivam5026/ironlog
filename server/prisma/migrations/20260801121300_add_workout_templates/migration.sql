-- CreateTable
CREATE TABLE "workout_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_day" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_exercise" (
    "id" TEXT NOT NULL,
    "templateDayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "gifUrl" TEXT,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" INTEGER NOT NULL DEFAULT 10,
    "restTime" INTEGER NOT NULL DEFAULT 90,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_template_userId_idx" ON "workout_template"("userId");

-- CreateIndex
CREATE INDEX "template_day_templateId_idx" ON "template_day"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "template_day_templateId_order_key" ON "template_day"("templateId", "order");

-- CreateIndex
CREATE INDEX "template_exercise_templateDayId_idx" ON "template_exercise"("templateDayId");

-- CreateIndex
CREATE INDEX "template_exercise_exerciseId_idx" ON "template_exercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "template_exercise_templateDayId_order_key" ON "template_exercise"("templateDayId", "order");

-- AddForeignKey
ALTER TABLE "workout_template" ADD CONSTRAINT "workout_template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_day" ADD CONSTRAINT "template_day_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "workout_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercise" ADD CONSTRAINT "template_exercise_templateDayId_fkey" FOREIGN KEY ("templateDayId") REFERENCES "template_day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
