/*
  Warnings:

  - Added the required column `exerciseName` to the `workout_plan_exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workout_plan_exercise"
ADD COLUMN "exerciseName" TEXT,
ADD COLUMN "gifUrl" TEXT;

-- Backfill: fall back to the ID for rows without a name; user re-adds to get real names
UPDATE "workout_plan_exercise" SET "exerciseName" = "exerciseId" WHERE "exerciseName" IS NULL;

ALTER TABLE "workout_plan_exercise" ALTER COLUMN "exerciseName" SET NOT NULL;
