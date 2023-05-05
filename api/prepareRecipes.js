require("dotenv").config();
const devResponse = require("./response.json");

const axios = require("axios");

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

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

    const messages = [
      {
        role: "system",
        content: `${process.env.RECIPE_PROMPT}: ${ingredients.join(", ")}`,
      },
    ];

    const options = {
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 3000,
      n: 1,
    };

    const isDev = process.env.DEV_ENABLED === "true";
    const choices = isDev
      ? devResponse.choices
      : await createChatCompletion(messages, options);

    const resultResponse = JSON.parse(choices[0].message.content);

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
