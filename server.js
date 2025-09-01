import express from "express";
import connectDB from "./Database/db.js";
import cors from "cors";
import path from "path";
import "./Database/env_config.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { protect } from "./middlewares/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import {
  generateInterviewQuestions,
  generateConceptExplanation,
} from "./controllers/aiController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDB();

//Middleware
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

// AI Routes - Use POST methods, not app.use
app.post("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
