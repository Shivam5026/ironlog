-- CreateTable
CREATE TABLE "body_weights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" DECIMAL(6,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "body_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "bestWeight" DECIMAL(8,2) NOT NULL,
    "bestVolume" DECIMAL(10,2) NOT NULL,
    "estimatedOneRepMax" DECIMAL(8,2) NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "body_weights_userId_recordedAt_idx" ON "body_weights"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "personal_records_userId_idx" ON "personal_records"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_records_userId_exerciseId_key" ON "personal_records"("userId", "exerciseId");

-- AddForeignKey
ALTER TABLE "body_weights" ADD CONSTRAINT "body_weights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
