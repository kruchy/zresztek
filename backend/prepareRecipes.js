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
    }, { responseType: 'stream' });
    return response
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
    return stream.data.data[0].url;
  } catch (error) {
    console.error("Error creating chat completion:", error);
  }
}

module.exports = async function prepareRecipesHandler(req, res, tempIngredientsStorage) {
  try {
    console.log(tempIngredientsStorage)
    const { ingredients, useOnlySelected } = tempIngredientsStorage[req.ip]
    if (!ingredients) {
      res.status(404).end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    

    const prompt = Buffer.from(process.env.SINGLE_RECIPE_PROMPT, 'base64')
      .toString("utf-8")
      .replace("{{spices}}", spices.join(", "))
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
      stream: true,
    };

    req.on('error', (e) => {
      console.error("problem with request:" + e.message);
    });


    if (isProduction) {
      try {
        const response = await createChatCompletion(messages, options);

        req.on('close', () => {
          res.end();
        });
        response.data.on('data', data => {
          const lines = data.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
              res.write('event: DONE\ndata:\n\n');
              res.end();
              return;
            }
            try {
              const parsed = JSON.parse(message);
              if (parsed.choices[0].delta.content) {
                res.write(`data: ${JSON.stringify(parsed.choices[0].delta.content)}\n\n`);
              }
            } catch (error) {
              console.error('Could not JSON parse stream message', message, error);
            }
          }
        });
      }
      catch (error) {
        if (error.response?.status) {
          console.error(error.response.status, error.message);
          error.response.data.on('data', data => {
            const message = data.toString();
            try {
              const parsed = JSON.parse(message);
              console.error('An error occurred during OpenAI request: ', parsed);
            } catch (error) {
              console.error('An error occurred during OpenAI request: ', message);
            }
          });
        } else {
          console.error('An error occurred during OpenAI request', error);
        }
      }


    } else {
      let recipe = devResponse.choices[0].message.content
      choices = [].concat(recipe).map((choice) => {
        const recipe = choice.recipe;
        const title = choice.title;
        const ingredients = choice.ingredients;
        let image = "https://img.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6471.jpg?w=512"
        return {
          title,
          recipe,
          ingredients,
          image,
        };
      })
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate recipes" });
  }
};
