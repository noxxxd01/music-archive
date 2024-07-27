import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import audioRoutes from "./routes/audioRoutes.js";

dotenv.config();
const app = express();

// Config
connectDB();

// Middlewares
app.use(
  cors({
    origin: [
      "https://music-archive-39ldy89t0-noirs-projects-550ebeb7.vercel.app/",
    ],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/audio", audioRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
