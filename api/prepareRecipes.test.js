const axios = require("axios");
const request = require("supertest");
const express = require("express");
const cors = require("cors");
const { json } = require("express");
const prepareRecipesHandler = require("./prepareRecipes");
jest.mock("axios");

describe("Server API", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(cors());
    app.use(json());
    app.post("/prepareRecipes", prepareRecipesHandler);
  });

  it("generateRecipes returns proper recipes for given API response", async () => {
    const sampleIngredients = ["pomidory", "jajka", "sałata"];
    const sampleRecipes = "[\n{\n\"title\": \"Title 1\",\n\"recipe\": \"Recipe 1\",\n\"ingredients\": [\n{\"ingredient\": \"Ingredient 1\", \"quantity\": \"500g\"},\n{\"ingredient\": \"ingredient 2\", \"quantity\": \"1 łyżeczka\"}\n]\n},\n{\n\"title\": \"Title 2\",\n\"recipe\": \"Recipe 2\",\n\"ingredients\": [\n{\"ingredient\": \"Ingredient 1\", \"quantity\": \"500g\"},\n{\"ingredient\": \"ingredient 2\", \"quantity\": \"1 łyżeczka\"}\n]\n},{\n\"title\": \"Title 3\",\n\"recipe\": \"Recipe 3\",\n\"ingredients\": [\n{\"ingredient\": \"Ingredient 1\", \"quantity\": \"500g\"},\n{\"ingredient\": \"ingredient 2\", \"quantity\": \"1 łyżeczka\"}\n]\n}\n]";
  
    axios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                content: sampleRecipes
              },
              finish_reason: 'stop',
              index: 0
            }
          ]
        }
    });
  
    const expectedRecipes = JSON.parse(sampleRecipes).map((choice) => {
      const recipe = choice.recipe;
      const title = choice.title;
      const ingredients = choice.ingredients;
      const image = "https://via.placeholder.com/150";
      return {
        title,
        recipe,
        ingredients,
        image
      };
    });

    const res = await request(app)
      .post("/prepareRecipes")
      .send({ ingredients: sampleIngredients })
      .expect("Content-Type", /json/)
      .expect(200);
  
    expect(res.body).toEqual(expectedRecipes);
  });
  

  it("generateRecipes returns 500 when API request fails", async () => {
    const sampleIngredients = ["potatoes", "onions", "carrots"];
    const errorMessage = "Failed to generate recipes";

    axios.post.mockRejectedValue(new Error(errorMessage));

    const res = await request(app)
      .post("/prepareRecipes")
      .send({ ingredients: sampleIngredients })
      .expect("Content-Type", /json/)
      .expect(500);

    expect(res.body).toEqual({ message: errorMessage });
  });
});
