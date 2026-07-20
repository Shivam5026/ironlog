import { z } from "zod";

import { updateProfileSchema } from "./profile.schemas";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;