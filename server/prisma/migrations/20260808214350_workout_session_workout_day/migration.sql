-- Add the column as nullable, backfill each session with its plan's first day,
-- then tighten to NOT NULL (existing rows have no day of origin).
ALTER TABLE "workout_session" ADD COLUMN "workoutDayId" TEXT;

UPDATE "workout_session" ws
SET "workoutDayId" = (
  SELECT d.id FROM "workout_day" d
  WHERE d."workoutPlanId" = ws."workoutPlanId"
  ORDER BY d."order" ASC
  LIMIT 1
);

ALTER TABLE "workout_session" ALTER COLUMN "workoutDayId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "workout_session_workoutDayId_idx" ON "workout_session"("workoutDayId");

-- AddForeignKey
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "workout_day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
