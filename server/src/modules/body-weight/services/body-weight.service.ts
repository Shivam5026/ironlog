import { prisma } from "../../../config/prisma";
import { invalidateDashboard } from "../../dashboard/services/dashboard.service";
import { ApiError } from "../../../utils/ApiError";
import type {
  BodyWeightEntry,
  BodyWeightList,
  CreateBodyWeightInput,
  UpdateBodyWeightInput,
} from "../types/body-weight.types";

const DEFAULT_HISTORY_LIMIT = 100;

function roundWeight(weight: number): number {
  return Math.round(weight * 100) / 100;
}

function toEntry(record: {
  id: string;
  weight: unknown;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): BodyWeightEntry {
  return {
    id: record.id,
    weight: Number(record.weight),
    recordedAt: record.recordedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function verifyWeightOwnership(weightId: string, userId: string) {
  const record = await prisma.bodyWeight.findUnique({
    where: { id: weightId },
    select: { id: true, userId: true },
  });

  if (!record) {
    throw new ApiError(404, "Body weight entry not found");
  }

  if (record.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return record;
}

async function createBodyWeight(
  userId: string,
  data: CreateBodyWeightInput,
): Promise<BodyWeightEntry> {
  const record = await prisma.bodyWeight.create({
    data: {
      userId,
      weight: roundWeight(data.weight),
      recordedAt: data.recordedAt ?? new Date(),
    },
  });

  await invalidateDashboard(userId);

  return toEntry(record);
}

async function getBodyWeightHistory(
  userId: string,
  limit?: number,
): Promise<BodyWeightList> {
  const records = await prisma.bodyWeight.findMany({
    where: { userId },
    orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
    take: limit ?? DEFAULT_HISTORY_LIMIT,
  });

  return { items: records.map(toEntry) };
}

async function updateBodyWeight(
  weightId: string,
  userId: string,
  data: UpdateBodyWeightInput,
): Promise<BodyWeightEntry> {
  await verifyWeightOwnership(weightId, userId);

  const record = await prisma.bodyWeight.update({
    where: { id: weightId },
    data: {
      weight: roundWeight(data.weight),
      ...(data.recordedAt !== undefined && { recordedAt: data.recordedAt }),
    },
  });

  await invalidateDashboard(userId);

  return toEntry(record);
}

async function deleteBodyWeight(
  weightId: string,
  userId: string,
): Promise<void> {
  await verifyWeightOwnership(weightId, userId);

  await prisma.bodyWeight.delete({ where: { id: weightId } });

  await invalidateDashboard(userId);
}

export const bodyWeightService = {
  createBodyWeight,
  getBodyWeightHistory,
  updateBodyWeight,
  deleteBodyWeight,
};
