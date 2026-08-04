-- CreateEnum
CREATE TYPE "WorkoutSessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('WARMUP', 'WORKING', 'FAILURE');

-- CreateTable
CREATE TABLE "workout_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "status" "WorkoutSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "totalVolume" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_log" (
    "id" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "exerciseOrder" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_log_set" (
    "id" TEXT NOT NULL,
    "exerciseLogId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weight" DECIMAL(8,2) NOT NULL,
    "reps" INTEGER NOT NULL,
    "restTime" INTEGER NOT NULL DEFAULT 90,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "setType" "SetType" NOT NULL DEFAULT 'WORKING',
    "isWarmup" BOOLEAN NOT NULL DEFAULT false,
    "isFailure" BOOLEAN NOT NULL DEFAULT false,
    "rpe" DECIMAL(4,1),
    "rir" INTEGER,
    "tempo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_log_set_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_session_userId_idx" ON "workout_session"("userId");

-- CreateIndex
CREATE INDEX "workout_session_workoutPlanId_idx" ON "workout_session"("workoutPlanId");

-- CreateIndex
CREATE INDEX "exercise_log_workoutSessionId_idx" ON "exercise_log"("workoutSessionId");

-- CreateIndex
CREATE INDEX "exercise_log_set_exerciseLogId_idx" ON "exercise_log_set"("exerciseLogId");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_log_set_exerciseLogId_setNumber_key" ON "exercise_log_set"("exerciseLogId", "setNumber");

-- AddForeignKey
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_log" ADD CONSTRAINT "exercise_log_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "workout_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_log_set" ADD CONSTRAINT "exercise_log_set_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "exercise_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;
