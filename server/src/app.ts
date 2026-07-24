import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { apiLimiter } from "./middlewares/rateLimiter";
import { env } from "./config/env";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./modules/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";

import profileRouter from "./modules/profile/profile.route";
import exerciseRoutes from "./modules/exercise/exercise.routes";

const app = express();

app.use(helmet());

app.use(compression());

app.use(morgan("dev"));

app.use(apiLimiter);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/profile", profileRouter);
app.use("/api/exercises", exerciseRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
