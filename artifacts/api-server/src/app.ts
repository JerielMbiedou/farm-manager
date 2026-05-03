import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "node:path";
import fs from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const PgStore = connectPgSimple(session);

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const frontendUrl = process.env.FRONTEND_URL?.trim();
const corsOrigin: cors.CorsOptions["origin"] = frontendUrl
  ? frontendUrl.split(",").map((s) => s.trim()).filter(Boolean)
  : true;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET env variable is required");
}

const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: "session",
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "strict" : "lax",
    },
  }),
);

const PUBLIC_API_PATHS = new Set<string>([
  "/auth/login",
  "/auth/logout",
  "/healthz",
]);

app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  if (PUBLIC_API_PATHS.has(req.path)) return next();
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
});

app.use("/api", router);

app.use("/api", (err: any, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err, path: req.path, method: req.method }, "Unhandled API error");
  if (res.headersSent) return;
  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({
    error: "Erreur serveur",
    message: err?.message ?? "Une erreur inattendue est survenue",
  });
});

if (isProduction) {
  const frontendDist = path.resolve(
    __dirname,
    "../../ferme-familiale/dist/public",
  );

  if (fs.existsSync(frontendDist)) {
    logger.info({ frontendDist }, "Serving frontend from disk");
    app.use(express.static(frontendDist, { index: false, maxAge: "1h" }));

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== "GET") return next();
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  } else {
    logger.warn(
      { frontendDist },
      "Frontend dist directory not found — API will run without static frontend",
    );
  }
}

export default app;
