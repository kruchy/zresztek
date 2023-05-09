require("dotenv").config();
const knownIngredients = require("./ingredients");
const spices = require("./spices");

const devResponse = require("./response.json");

const axios = require("axios");

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

const isProduction = process.env.NODE_ENV === "production";

async function createChatCompletion(messages, options = {}) {
  try {
    const response = await openai.post("/chat/completions", {
      model: options.model || "gpt-3.5-turbo",
      messages,
      ...options,
    });

    return response.data.choices;
  } catch (error) {
    console.error("Error creating chat completion:", error);
  }
}

module.exports = async function prepareRecipesHandler(req, res) {
  try {
    if (req.body && req.body.ingredients.length === 0) {
      throw new Error("Ingredients are empty");
    }
    const ingredients = req.body.ingredients;

    // Check if all ingredients in req.body.ingredients are in the knownIngredients array
    const areIngredientsValid = ingredients.every((ingredient) =>
      knownIngredients.includes(ingredient)
    );

    if (!areIngredientsValid) {
      throw new Error("Invalid ingredient(s) detected");
    }
    const recipesNumber = req.body.recipesNumber
    const useOnlySelected = req.body.useOnlySelected

    const prompt = process.env.RECIPE_PROMPT
      .replace("{{spices}}", spices.join(", "))
      .replace("{{recipesNumber}}", recipesNumber || 3)
      .replace("{{useOnlySelected}}", useOnlySelected ? process.env.CONSTANT_INGREDIENTS : process.env.VARYING_INGREDIENTS)

    const messages = [
      {
        role: "system",
        content: `${prompt}: ${ingredients.join(", ")}`,
      },
    ];

    const options = {
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 5000,
      n: 1,
    };

    const choices = isProduction
      ? await createChatCompletion(messages, options)
      : devResponse.choices;

    const resultResponse = isProduction
      ? JSON.parse(choices[0].message.content)
      : choices[0].message.content;

    const generatedRecipes = resultResponse.map((choice) => {
      const recipe = choice.recipe;
      const title = choice.title;
      const ingredients = choice.ingredients;
      return {
        title,
        recipe,
        ingredients,
      };
    });

    res.status(200).json(generatedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate recipes" });
  }
};
