import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 8000;

// URL сервисов из переменных окружения
const MONOLITH_URL = process.env.MONOLITH_URL!;
const MOVIES_SERVICE_URL = process.env.MOVIES_SERVICE_URL!;
const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL!;
const GRADUAL_MIGRATION = process.env.GRADUAL_MIGRATION === "true";
const MOVIES_MIGRATION_PERCENT = parseInt(
  process.env.MOVIES_MIGRATION_PERCENT || "0"
);

// Вспомогательная функция: случайный выбор между сервисами
function getRandomService(
  primary: string,
  secondary: string,
  percent: number
): string {
  const rand = Math.random() * 100;
  return rand < percent ? secondary : primary;
}

// Фабрика миграционного прокси
function createMigrationProxy(
  targetPrimary: string,
  targetSecondary: string = targetPrimary
) {
  return (req: any, res: any, next: any) => {
    if (GRADUAL_MIGRATION && MOVIES_MIGRATION_PERCENT > 0) {
      const target = getRandomService(
        targetPrimary,
        targetSecondary,
        MOVIES_MIGRATION_PERCENT
      );
      createProxyMiddleware({
        target,
        changeOrigin: true,
      })(req, res, next);
    } else {
      createProxyMiddleware({ target: MONOLITH_URL, changeOrigin: true })(
        req,
        res,
        next
      );
    }
  };
}

app.use("/api/movies", createMigrationProxy(MONOLITH_URL, MOVIES_SERVICE_URL));
app.use("/api/movies/health", createMigrationProxy(MOVIES_SERVICE_URL));

//  маршруты которые пока работают только через монолит
app.use("/api/users", createMigrationProxy(MONOLITH_URL));
app.use("/api/payments", createMigrationProxy(MONOLITH_URL));
app.use("/api/subscriptions", createMigrationProxy(MONOLITH_URL));
app.use("/api/health", createMigrationProxy(MONOLITH_URL));

// Прокси для /api/events
app.use(
  "/api/events",
  createProxyMiddleware({
    target: EVENTS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/events": "",
    },
  })
);

// Health-check самого прокси
app.get("/", (req, res) => {
  res.send("Proxy Service is running");
});

// Запуск сервера
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Proxy service is running on port ${PORT}`);
});
