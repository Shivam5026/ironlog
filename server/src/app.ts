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
import { workoutPlanRouter } from "./modules/workout-plan";
import { workoutDayRouter } from "./modules/workout-day";
import { workoutExerciseRouter } from "./modules/workout-exercise";
import { templateRouter } from "./modules/template";
import { dashboardRouter } from "./modules/dashboard";
import {
  workoutSessionRouter,
  exerciseLogRouter,
  exerciseLogSetRouter,
  performanceRouter,
  recoveryRouter,
  workoutSummaryRouter,
  historyRouter,
} from "./modules/workout-session";

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
app.use("/api/workout-plans", workoutPlanRouter);
app.use("/api/workout-days", workoutDayRouter);
app.use("/api/workout-exercises", workoutExerciseRouter);
app.use("/api/templates", templateRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/workout-sessions", workoutSessionRouter);
app.use("/api/workout-sessions", workoutSummaryRouter);
app.use("/api/exercise-logs", exerciseLogRouter);
app.use("/api/exercise-log-sets", exerciseLogSetRouter);
app.use("/api/performance", performanceRouter);
app.use("/api/recovery", recoveryRouter);
app.use("/api/history", historyRouter);

app.use(notFound);

app.use(errorHandler);

export default app;
