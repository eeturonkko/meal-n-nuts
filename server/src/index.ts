import cors from "cors";
import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import diaryRouter from "./routes/diary.js";
import foodRouter from "./routes/food.js";
import recipesRouter from "./routes/recipes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4000);

dotenv.config({ path: path.join(__dirname, ".env") });

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/food", foodRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/diary", diaryRouter);
app.use(express.static(path.join(__dirname, "./public")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
