import express from "express";
import cors from "cors";
import recipesRouter from "./routes/recipes.js";

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "husmansbanken-frontend-ghhp1dx3d-jumis-projects-6389d075.vercel.app"
];
const corsOptions: cors.CorsOptions = {
  origin: function(origin, callback) {
    if(!origin || allowedOrigins.indexOf(origin) !== -1) {
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
