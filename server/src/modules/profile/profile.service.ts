import { prisma } from "../../config/prisma";
import type { UpdateProfileInput } from "./profile.types";

async function createProfileIfMissing(userId: string) {
  const existingProfile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });

  if (existingProfile) {
    return existingProfile;
  }

  return prisma.profile.create({
    data: {
      userId,
    },
  });
}

async function getProfile(userId: string) {
  await createProfileIfMissing(userId);

  return prisma.profile.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

async function updateProfile(
  userId: string,
  data: UpdateProfileInput
) {
  const {
    name,
    ...profileData
  } = data;

  await createProfileIfMissing(userId);

  return prisma.$transaction(async (tx) => {
    if (name !== undefined) {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
        },
      });
    }

    return tx.profile.update({
      where: {
        userId,
      },
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  });
}

export const profileService = {
    createProfileIfMissing,
    getProfile,
    updateProfile,
}