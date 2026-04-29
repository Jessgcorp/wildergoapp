import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer } from "node:http";
import authRoutes from "./routes/authRoutes";
import { initializeFirebase } from "./services/firebase";
import * as fs from "fs";
import * as path from "path";

const app = express();
const log = console.log;

app.get("/test-deploy", (_req: Request, res: Response) =>
  res.send("DEPLOYED_APRIL_26_V1"),
);

app.get("/health", (_req: Request, res: Response) => {
  res.send("Server Version 2.0 - LIVE");
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    const origin = req.header("origin");

    // Allow localhost origins for Expo web development (any port, http or https)
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("https://localhost:") ||
      origin?.startsWith("http://127.0.0.1:") ||
      origin?.startsWith("https://127.0.0.1:");

    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
 const templatePath = path.resolve(
  process.cwd(),
  "templates",
  "landing-page.html",
);
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.join(__dirname, "../assets")));
  app.use(express.static(path.join(__dirname, "../static-build")));
  app.use(express.static(path.join(__dirname, "../templates")));
  app.use(express.static(path.join(__dirname, "./public")));

  // Catch-all route to serve landing page
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../templates/landing-page.html"));
  });

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

(async () => {
  try {
    initializeFirebase();
    console.log("[SERVER] Firebase initialized on startup");
  } catch (error) {
    console.error("[SERVER] Firebase initialization failed on startup:", error);
  }

  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  app.get("/test", (_req: Request, res: Response) => {
    res.send("Server is Live");
  });

  app.get("/status", (_req: Request, res: Response) => {
    res.json({ status: "online", version: "1.0.1" });
  });

  app.use("/api/auth", authRoutes);

  app.get("/", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../templates/landing-page.html"));
  });

  configureExpoAndLanding(app);

  // 1. Tell the server where the styles and images are
  app.use(express.static(path.join(process.cwd(), "..", "templates")));

  // 2. The main entry point
  app.get("/", (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), "..", "templates", "landing-page.html"));
  });

  // 3. The "Insurance Policy" - send any unknown URL to the landing page
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), "..", "templates", "landing-page.html"));
  });

  const server = createServer(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  const host =
    process.env.HOST ||
    (process.env.NODE_ENV === "development" ? "127.0.0.1" : "0.0.0.0");

  server.on("error", (err) => {
    console.error("[SERVER] listen error:", err);
  });

  const listenOptions: { port: number; host: string; reusePort?: boolean } = {
    port,
    host,
  };
  if (process.env.REUSE_PORT === "1") {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    log(`express server serving on http://${host}:${port}`);
  });
})();
