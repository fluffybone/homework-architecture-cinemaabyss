import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 8000;

const MONOLITH_URL = process.env.MONOLITH_URL || "http://monolith:8080";
const MOVIES_SERVICE_URL =
  process.env.MOVIES_SERVICE_URL || "http://movies-service:8081";
const EVENTS_SERVICE_URL =
  process.env.EVENTS_SERVICE_URL || "http://events-service:8082";
const GRADUAL_MIGRATION = process.env.GRADUAL_MIGRATION === "true" || true;
const MOVIES_MIGRATION_PERCENT = parseInt(
  process.env.MOVIES_MIGRATION_PERCENT || "50"
);

function getRandomService(
  primary: string,
  secondary: string,
  percent: number
): string {
  const rand = Math.random() * 100;
  return rand < percent ? secondary : primary;
}

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

app.use(
  "/api/health",
  createProxyMiddleware({
    target: MONOLITH_URL,
    changeOrigin: true,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "proxy-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/movies", createMigrationProxy(MONOLITH_URL, MOVIES_SERVICE_URL));
app.use("/api/movies/health", createMigrationProxy(MOVIES_SERVICE_URL));

app.use("/api/users", createMigrationProxy(MONOLITH_URL));
app.use("/api/payments", createMigrationProxy(MONOLITH_URL));
app.use("/api/subscriptions", createMigrationProxy(MONOLITH_URL));

app.use(
  "/api/events",
  createProxyMiddleware({
    target: EVENTS_SERVICE_URL,
    changeOrigin: true,
  })
);

app.get("/", (req, res) => {
  res.send("Proxy Service is running");
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Proxy service is running on port ${PORT}`);
});
