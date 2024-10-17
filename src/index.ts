import express from "express";
import cors from "cors";
import { config } from "dotenv";
import recipesRouter from "./routes/recipes.js";
import { PrismaClient } from "@prisma/client";

// Load environment variables
config();

const app = express();
const prisma = new PrismaClient();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? JSON.parse(process.env.ALLOWED_ORIGINS) 
  : ["http://localhost:5173", "https://husmansbanken-frontend.vercel.app"];

const corsOptions: cors.CorsOptions = {
  origin: function(origin, callback) {
    if(!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}; 

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

// Import routes
app.use("/recipes", recipesRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      database: "connected"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Only start the server if we're not in a Vercel environment
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
