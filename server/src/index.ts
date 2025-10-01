import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.get("/health", (_req, res) => {
  try {
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "error", error: "db_unreachable" });
  }
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
