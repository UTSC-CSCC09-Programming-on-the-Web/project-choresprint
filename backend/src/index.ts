import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import { prisma } from "./lib/prisma";
import { initSocket } from "./config/socket";
import passport from "./config/passport";

import { router as choresRouter } from "./routes/chores";
import { router as housesRouter } from "./routes/houses";
import { router as authRouter } from "./routes/auth";
import { router as usersRouter } from "./routes/users";
import { router as paymentsRouter } from "./routes/payments";

import { scheduleWeeklyDigest } from "./workers/weeklyDigestWorker";

dotenv.config();
const app = express();
const server = http.createServer(app);

initSocket(server);

// import "./workers/aiVerificationWorker";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://www.choresprint.app",
      "http://www.choresprint.app",
    ],
    credentials: true, // Important for cookies to work cross-domain
  }),
);
app.use("/api/payments/webhook", bodyParser.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend running!");
});

const PORT = process.env.PORT || 4000;

prisma
  .$connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
    scheduleWeeklyDigest();
  })
  .catch((err: any) => {
    console.error("❌ Failed to connect to DB:", err);
  });

app.use(passport.initialize());
app.use("/api/chores", choresRouter);
app.use("/api/houses", housesRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/payments", paymentsRouter);
