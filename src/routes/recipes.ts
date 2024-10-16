import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /recipes: Fetches all recipes from the database
router.get("/", async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany();
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /recipes: Creates a new recipe
router.post("/", async (req, res) => {
  const { title, ingredients, instructions, cookingTime, servings } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ error: "Title, ingredients, and instructions are required." });
  }

  try {
    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        ingredients,
        instructions,
        cookingTime: cookingTime || 0, //default to 0 if not provided
        servings: servings || 1, //default to 1 if not provided

      },
    });
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /recipes/:id - Fetch a single recipe by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: id },
    });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /recipes/:id - Update a recipe
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, ingredients, instructions, cookingTime, servings } = req.body;
  try {
    const updatedRecipe = await prisma.recipe.update({
      where: { id: id },
      data: {
        title,
        ingredients,
        instructions,
        cookingTime,
        servings,
      },
    });
    res.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /recipes/:id - Delete a recipe
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.recipe.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
