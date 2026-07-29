-- CreateTable
CREATE TABLE "workout_plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_day" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plan_exercise" (
    "id" TEXT NOT NULL,
    "workoutDayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" INTEGER NOT NULL DEFAULT 10,
    "restTime" INTEGER NOT NULL DEFAULT 90,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_plan_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_plan_userId_idx" ON "workout_plan"("userId");

-- CreateIndex
CREATE INDEX "workout_day_workoutPlanId_idx" ON "workout_day"("workoutPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "workout_day_workoutPlanId_order_key" ON "workout_day"("workoutPlanId", "order");

-- CreateIndex
CREATE INDEX "workout_plan_exercise_workoutDayId_idx" ON "workout_plan_exercise"("workoutDayId");

-- CreateIndex
CREATE INDEX "workout_plan_exercise_exerciseId_idx" ON "workout_plan_exercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "workout_plan_exercise_workoutDayId_order_key" ON "workout_plan_exercise"("workoutDayId", "order");

-- AddForeignKey
ALTER TABLE "workout_plan" ADD CONSTRAINT "workout_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_day" ADD CONSTRAINT "workout_day_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plan_exercise" ADD CONSTRAINT "workout_plan_exercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "workout_day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
