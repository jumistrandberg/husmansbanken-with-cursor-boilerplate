// cors.ts
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? JSON.parse(process.env.ALLOWED_ORIGINS) 
  : ["http://localhost:5173"];

// Add development logging for CORS issues
const debugCors = (origin: string | undefined) => {
  console.log('Request origin:', origin);
  console.log('Allowed origins:', allowedOrigins);
};

export const corsOptions: cors.CorsOptions = {
  origin: function(origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      debugCors(origin);
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin} not in`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// recipes.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Error handling middleware
const handlePrismaError = (error: any, res: express.Response) => {
  console.error("Database error:", error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({ error: "A unique constraint would be violated." });
      case 'P2025':
        return res.status(404).json({ error: "Record not found." });
      default:
        return res.status(500).json({ 
          error: "Database error", 
          code: error.code,
          detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
  
  return res.status(500).json({ 
    error: "Internal server error",
    detail: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// GET /recipes: Fetches all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(recipes);
  } catch (error) {
    handlePrismaError(error, res);
  }
});

// POST /recipes: Creates a new recipe
router.post("/", async (req, res) => {
  const { title, ingredients, instructions, cookingTime, servings } = req.body;

  if (!title?.trim() || !ingredients?.length || !instructions?.trim()) {
    return res.status(400).json({ 
      error: "Invalid input",
      details: {
        title: !title?.trim() ? "Title is required" : null,
        ingredients: !ingredients?.length ? "Ingredients are required" : null,
        instructions: !instructions?.trim() ? "Instructions are required" : null
      }
    });
  }

  try {
    const newRecipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        ingredients,
        instructions: instructions.trim(),
        cookingTime: cookingTime || 0,
        servings: servings || 1,
      },
    });
    res.status(201).json(newRecipe);
  } catch (error) {
    handlePrismaError(error, res);
  }
});

// GET /recipes/:id - Fetch a single recipe
router.get("/:id", async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
    });
    
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    res.json(recipe);
  } catch (error) {
    handlePrismaError(error, res);
  }
});

// PUT /recipes/:id - Update a recipe
router.put("/:id", async (req, res) => {
  const { title, ingredients, instructions, cookingTime, servings } = req.body;

  try {
    const updatedRecipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(ingredients && { ingredients }),
        ...(instructions && { instructions: instructions.trim() }),
        ...(cookingTime !== undefined && { cookingTime }),
        ...(servings !== undefined && { servings }),
      },
    });
    res.json(updatedRecipe);
  } catch (error) {
    handlePrismaError(error, res);
  }
});

// DELETE /recipes/:id - Delete a recipe
router.delete("/:id", async (req, res) => {
  try {
    await prisma.recipe.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(error, res);
  }
});

export default router;