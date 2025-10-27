import express from "express";
import { db } from "../db.js";

const router = express.Router();

const insertEntry = db.prepare(
  `INSERT INTO meal_entries
   (user_id, date, meal, name, amount, unit, calories, protein, carbohydrate, fat, water, source, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
);

const deleteEntryStmt = db.prepare(
  `DELETE FROM meal_entries WHERE id = ? AND user_id = ?`
);

const listDayEntriesStmt = db.prepare(
  `SELECT id, meal, name, amount, unit, calories, protein, carbohydrate, fat, water
   FROM meal_entries
   WHERE user_id = ? AND date = ?
   ORDER BY created_at ASC, id ASC`
);

const sumDayTotalsStmt = db.prepare(
  `SELECT
     COALESCE(SUM(calories),0) AS calories,
     COALESCE(SUM(protein),0) AS protein,
     COALESCE(SUM(carbohydrate),0) AS carbohydrate,
     COALESCE(SUM(fat),0) AS fat,
     COALESCE(SUM(water),0) AS water
   FROM meal_entries
   WHERE user_id = ? AND date = ?`
);

const readEntryStmt = db.prepare(
  `SELECT id, user_id, date, meal, name, amount, unit, calories, protein, carbohydrate, fat, water, source, created_at
   FROM meal_entries
   WHERE id = ? AND user_id = ? LIMIT 1`
);

const listSummaryStmt = db.prepare(
  `SELECT date,
     COALESCE(SUM(calories),0) AS calories,
     COALESCE(SUM(protein),0) AS protein,
     COALESCE(SUM(carbohydrate),0) AS carbohydrate,
     COALESCE(SUM(fat),0) AS fat,
     COALESCE(SUM(water),0) AS water
   FROM meal_entries
   WHERE user_id = ? AND date BETWEEN ? AND ?
   GROUP BY date
   ORDER BY date ASC`
);

function toDateOnly(s?: string) {
  const d = s ? new Date(s) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

router.post("/add-many", (req, res) => {
  try {
    const user_id = String(req.body.user_id || "").trim();
    const date = toDateOnly(req.body.date);
    const meal = String(req.body.meal || "").trim();
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!user_id || !meal || items.length === 0) {
      return res.status(400).json({ error: "invalid_payload" });
    }
    const tx = db.transaction((rows: any[]) => {
      for (const it of rows) {
        const name = String(it.name || "").trim();
        const amount = Number(it.amount || 0);
        const unit = String(it.unit || "g");
        const calories = Number(it.calories || 0);
        const protein = Number(it.protein || 0);
        const carbohydrate = Number(it.carbohydrate || 0);
        const fat = Number(it.fat || 0);
        const water = Number(it.water || 0);
        insertEntry.run(
          user_id,
          date,
          meal,
          name,
          amount,
          unit,
          calories,
          protein,
          carbohydrate,
          fat,
          water,
          "manual"
        );
      }
    });
    tx(items);
    const entries = listDayEntriesStmt.all(user_id, date);
    const totals = sumDayTotalsStmt.get(user_id, date);
    return res.json({ ok: true, date, meal, entries, totals });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: "add_many_failed", message: e.message });
  }
});

router.post("/add-water", (req, res) => {
  try {
    const user_id = String(req.body.user_id || "").trim();
    const date = toDateOnly(req.body.date);
    const amount = Number(req.body.amount || 0);

    if (!user_id || amount <= 0) {
      return res.status(400).json({ error: "invalid_payload" });
    }

    insertEntry.run(
      user_id,
      date,
      "water",
      "Vesi",
      amount,
      "ml",
      0,
      0,
      0,
      0,
      amount,
      "manual"
    );

    const entries = listDayEntriesStmt.all(user_id, date);
    const totals = sumDayTotalsStmt.get(user_id, date);
    return res.json({ ok: true, date, entries, totals });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: "add_water_failed", message: e.message });
  }
});

router.get("/day", (req, res) => {
  try {
    const user_id = String(req.query.user_id || "").trim();
    const date = toDateOnly(String(req.query.date || ""));
    if (!user_id) return res.status(400).json({ error: "missing_user_id" });
    const entries = listDayEntriesStmt.all(user_id, date);
    const totals = sumDayTotalsStmt.get(user_id, date);
    return res.json({ date, entries, totals });
  } catch (e: any) {
    return res.status(500).json({ error: "day_failed", message: e.message });
  }
});

router.delete("/entry/:id", (req, res) => {
  try {
    const user_id = String(req.query.user_id || req.body?.user_id || "").trim();
    const id = parseInt(String(req.params.id || "0"), 10) || 0;
    if (!user_id || !id)
      return res.status(400).json({ error: "invalid_request" });
    deleteEntryStmt.run(id, user_id);
    const row = readEntryStmt.get(id, user_id);
    return res.json({ ok: true, deleted: !row });
  } catch (e: any) {
    return res.status(500).json({ error: "delete_failed", message: e.message });
  }
});

router.get("/summary", (req, res) => {
  try {
    const user_id = String(req.query.user_id || "").trim();
    const from = toDateOnly(String(req.query.from || ""));
    const to = toDateOnly(String(req.query.to || ""));
    if (!user_id) return res.status(400).json({ error: "missing_user_id" });
    const rows = listSummaryStmt.all(user_id, from, to);
    return res.json({ from, to, rows });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: "summary_failed", message: e.message });
  }
});

export default router;
