require("dotenv").config();
const axios = require("axios");

export default async function prepareRecipesHandler(req, res) {
  try {
    if (req.body && req.body.ingredients.length === 0) {
      throw new Error("Ingredients are empty");
    }

    const ingredients = req.body.ingredients;

    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "gpt-3.5-turbo",
        role: "system",
        prompt: `${process.env.RECIPE_PROMPT} ${ingredients.join(", ")}`,
        max_tokens: 3000,
        n: 3,
        stop: null,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const generatedRecipes = response.data.choices.map((choice) => {
      // Extract recipe details from the generated text
      // This is a simplified example, you may need to adjust the extraction logic
      const lines = choice.text.trim().split("\n");
      const title = lines[0];
      const description = lines.slice(1).join("\n");

      return {
        title,
        description,
        image: "https://via.placeholder.com/150", // Replace with a real image URL
      };
    });

    res.status(200).json(generatedRecipes);
  } catch (error) {
    let errorContent = error;

    if (error.response) {
      errorContent = error.response.data.error.message;
    }

    console.error(errorContent);

    res.status(500).json({
      message: "Failed to generate recipes",
      error: errorContent,
    });
  }
}
