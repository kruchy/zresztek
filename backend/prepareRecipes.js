require("dotenv").config();
const knownIngredients = require("./ingredients");
const spices = require("./spices");

const devResponse = require("./response.json");

const axios = require("axios");
const { response } = require("express");

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

async function createImage(message) {
  try {
    const response = await openai.post("/images/generations", {
      prompt: message,
      size: "512x512",
      response_format: "url",
    });
    console.log(message)
    // console.log(response)

    console.log(response.data)
    return response.data.data[0].url;
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

    const prompt = process.env.SINGLE_RECIPE_PROMPT
      .replace("{{spices}}", spices.join(", "))
      .replace("{{recipesNumber}}", recipesNumber || 3)
      .replace("{{useOnlySelected}}", useOnlySelected ? process.env.CONSTANT_INGREDIENTS : process.env.SINGLE_VARYING_INGREDIENTS)

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

    let choices;
    if (isProduction) {
      let array = [];
      for(let i = 0; i < recipesNumber; i++) {
        array.push(createChatCompletion(messages, options));
    }
      // const requests = [createChatCompletion(messages, options), createChatCompletion(messages, options), createChatCompletion(messages, options)];
      const responses = await Promise.all(array);
      choices = [].concat(...responses.map(response => JSON.parse(response[0].message.content)));
    } else {
      let recipe = devResponse.choices[0].message.content
      choices = [].concat(recipe);
    }

    const resultResponse = choices

    const generatedRecipesPromises = resultResponse.map(async (choice) => {
      const recipe = choice.recipe;
      const title = choice.title;
      const ingredients = choice.ingredients;
      const image = await createImage(choice.imagePrompt);
      return {
        title,
        recipe,
        ingredients,
        image,
      };
    });
    
    const generatedRecipes = await Promise.all(generatedRecipesPromises);
    console.log(JSON.stringify(generatedRecipes))
    res.status(200).json(generatedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate recipes" });
  }
};
