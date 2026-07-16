import app from "./app";
import { env } from "./config/env";

app.get("/", (_req, res) => {
  res.json({
    message: "IronLog API is running 🚀",
  });
});

app.listen(Number(env.PORT), () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});