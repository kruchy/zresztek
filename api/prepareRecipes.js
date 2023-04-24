require("dotenv").config();
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

module.exports =  async function prepareRecipesHandler(req, res) {
  try {
    if(req.body && req.body.ingredients.length === 0){
      throw new Error('Ingredients are empty');
    }
    const ingredients = req.body.ingredients;
    

    // const messages = [
    //   { role: "user", content: `${process.env.RECIPE_PROMPT}: ${ingredients.join(", ")}`, },
    // ];

    // const options = {
    //   temperature: 0.8,
    //   max_tokens: 3000,
    // };

    // const choices = await createChatCompletion(messages, options);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {content: `${process.env.RECIPE_PROMPT}: ${ingredients.join(", ")}`,
          role: "system"}
        ],
        max_tokens: 3000,
        n: 1,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const generatedRecipes = JSON.parse(response.data.choices[0].message.content).map((choice) => {
      const recipe = choice.recipe;
      const title = choice.title;
      const ingredients = choice.ingredients;
      const image = "https://via.placeholder.com/150"
      return {
        title,
        recipe,
        ingredients,
        image
      };
    });

    res.status(200).json(generatedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate recipes"});
  }
}


