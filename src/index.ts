import express from "express";
import cors from "cors";
import recipesRouter from "./routes/recipes.js";
import { corsOptions } from "./config/cors.js";

const app = express();

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

// Import routes
app.use("/recipes", recipesRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Use environment variable for PORT
const PORT = process.env.PORT || 3000;

// Start the server based on the environment
if (process.env.NODE_ENV !== "production") {
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
