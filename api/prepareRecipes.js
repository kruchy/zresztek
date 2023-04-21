require("dotenv").config();
import express, { json } from "express";
import { post } from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(json());

export async function generateRecipesHandler(req, res) {
  const ingredients = req.body.ingredients;

  try {
    const response = await post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt: `Generate recipes using the following ingredients: ${ingredients.join(
          ", "
        )}`,
        max_tokens: 300,
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

    res.json(generatedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate recipes" });
  }
}

app.post("/generateRecipes", generateRecipesHandler);

export const server = app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
