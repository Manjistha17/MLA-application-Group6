const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected (nutrition-api)"))
  .catch((err) => console.error("MongoDB connection error:", err));


const NutritionSchema = new mongoose.Schema({
  userId: String,
  food: String,
  calories: Number,
  water: Number,
  date: String,
});

const Nutrition = mongoose.model("Nutrition", NutritionSchema);

app.post("/nutrition/log", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);   // 👈 ADD THIS

    const entry = new Nutrition(req.body);
    await entry.save();

    res.status(201).json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save entry" });
  }
});


app.get("/nutrition/:date/:userId", async (req, res) => {
  try {
    const { date, userId } = req.params;
    const data = await Nutrition.find({ date, userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(5005, () => console.log("Nutrition API running on port 5005"));


app.put("/nutrition/:id", async (req, res) => {
  try {
    const updated = await Nutrition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/nutrition/:id", async (req, res) => {
  try {
    await Nutrition.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

