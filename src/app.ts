import express from "express";

import "express-async-errors";
import errorHandler from "@/middlewares/error-handler.middleware";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import NotFound from "@/middlewares/not-found.middleware";
import cors from "cors";
import { ALLOWED_ORIGINS, NODE_ENV, PRODUCTION } from "@/config/env";
// import helmet from "helmet";
// import morgan from "morgan";
// import logger from "@/middlewares/logger.middleware";
import passport from "passport";
import agentRouter from "@/routes/agent.route";
import fs from "fs";
import path from "path";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@/config/db.connection";

// import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./swagger";

import logger from "./middlewares/logger.middleware";
import morgan from "morgan";
import { JWT_SECRET } from "./config";
const prefixRoute = "/api/v1";

export const app = express();

const sessionStore = connectPgSimple(session);

app.set("trust proxy", true);
app.use(
    session({
        store: new sessionStore({
            pool,
            tableName: "agentic_chat_sessions",
            createTableIfMissing: true,
            pruneSessionInterval: 60 * 60, // 1 hour
        }),
        secret: JWT_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: PRODUCTION, maxAge: 60 * 60 * 1000 * 24 }, // 24 hours
    }),
);
// app.use(helmet());
app.use(express.static(path.join(__dirname, "../public")));

if (NODE_ENV !== "production") {
    app.use(
        // morgan(NODE_ENV === "production" ? "combined" : "dev", {
        morgan("dev", {
            stream: logger(),
        }),
    );
}

app.use(
    "/swagger-ui",
    express.static(path.join(__dirname, "node_modules", "swagger-ui-dist")),
);

app.get("/swagger.json", (_req, res) => {
    res.json(
        PRODUCTION
            ? JSON.parse(
                  fs.readFileSync(
                      path.join(__dirname, "./swagger.json"),
                      "utf-8",
                  ),
              )
            : swaggerSpec,
    );
});

app.get("/api-docs", (_req, res) => {
    res.sendFile(path.join(__dirname, "./templates/swagger.html"));
});
app.use("/api", cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());

app.use(`${prefixRoute}/agents`, agentRouter);

app.all("*", NotFound);
app.use(errorHandler);

export default app;
