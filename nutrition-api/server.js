const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected (nutrition-api)"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── AI Calorie + Macro Lookup ──
app.post("/nutrition/ai-lookup", async (req, res) => {
  const { food, portionSize, portionUnit } = req.body;
  if (!food) return res.status(400).json({ error: "Food name is required" });
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are a nutrition database. Return ONLY a JSON object, no explanation, no markdown.

Food: "${food}"
Portion: ${portionSize || 100}${portionUnit || "g"}

JSON format:
{
  "calories": <number>,
  "protein": <grams as number>,
  "carbs": <grams as number>,
  "fat": <grams as number>,
  "note": "<brief note if uncertain, else empty string>"
}`,
      }],
    });
    const clean = message.content[0].text.trim().replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error("AI lookup error:", err);
    res.status(500).json({ error: "AI lookup failed" });
  }
});

// ── AI Meal Suggestion ──
app.post("/nutrition/ai-suggest", async (req, res) => {
  const { caloriesConsumed, calorieGoal, caloriesBurned, loggedFoods, mealType } = req.body;
  const remaining = calorieGoal - caloriesConsumed + (caloriesBurned || 0);
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `You are a fitness nutrition coach familiar with Indian and international cuisine. Suggest 3 meal ideas based on remaining calories — always include at least 1-2 Indian options (e.g. dal, khichdi, paneer sabzi, roti, idli, dosa, poha, upma, curd rice, rajma, chana).

Calories consumed today: ${caloriesConsumed} kcal
Calories burned today: ${caloriesBurned || 0} kcal
Daily calorie goal: ${calorieGoal} kcal
Remaining calories: ${remaining} kcal
Next meal: ${mealType || "any"}
Already eaten today: ${loggedFoods?.join(", ") || "nothing yet"}

Return ONLY a JSON array, no markdown:
[
  { "name": "<meal name>", "calories": <number>, "reason": "<one short sentence why>" },
  { "name": "<meal name>", "calories": <number>, "reason": "<one short sentence why>" },
  { "name": "<meal name>", "calories": <number>, "reason": "<one short sentence why>" }
]`,
      }],
    });
    const clean = message.content[0].text.trim().replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error("AI suggest error:", err);
    res.status(500).json({ error: "AI suggestion failed" });
  }
});

// ── Schema ──
const NutritionSchema = new mongoose.Schema({
  userId: { type: String, default: "" },
  food: { type: String, default: "" },
  portionSize: { type: Number, default: 100 },
  portionUnit: { type: String, default: "g" },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  mealType: { type: String, default: "" },
  water: { type: Number, default: 0 },
  date: { type: String, default: "" },
});

const Nutrition = mongoose.model("Nutrition", NutritionSchema);

// ── Log a meal or water ──
app.post("/nutrition/log", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const entry = new Nutrition(req.body);
    await entry.save();
    res.status(201).json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

// ── Get daily logs ──
app.get("/nutrition/:date/:userId", async (req, res) => {
  try {
    const { date, userId } = req.params;
    const data = await Nutrition.find({ date, userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ── Weekly summary (last 7 days) ──
app.get("/nutrition/weekly/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    const data = await Nutrition.find({ userId, date: { $in: days } });
    const result = days.map((date) => {
      const dayData = data.filter((d) => d.date === date);
      return {
        date,
        label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        calories: dayData.reduce((s, i) => s + Number(i.calories || 0), 0),
        protein: dayData.reduce((s, i) => s + Number(i.protein || 0), 0),
        carbs: dayData.reduce((s, i) => s + Number(i.carbs || 0), 0),
        fat: dayData.reduce((s, i) => s + Number(i.fat || 0), 0),
        water: dayData.reduce((s, i) => s + Number(i.water || 0), 0),
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weekly data" });
  }
});

// ── Update ──
app.put("/nutrition/:id", async (req, res) => {
  try {
    const updated = await Nutrition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ── Delete ──
app.delete("/nutrition/:id", async (req, res) => {
  try {
    await Nutrition.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(5005, () => console.log("Nutrition API running on port 5005"));