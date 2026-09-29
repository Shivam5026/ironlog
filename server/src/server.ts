import app from "./app";
import { prisma } from "./config/prisma";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL Connected");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }

  // Redis is optional — the app runs without it (falls back to PostgreSQL)
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`🚀 Server started on ${PORT}`);
  });
}

bootstrap();
