import app from "./app";
import { prisma } from "./config/prisma";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL Connected");

    await connectRedis();
    app.listen(PORT, () => {
      console.log(`🚀 Server started on ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
