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
    const sampleRecipes = [
      {
        title: "Sałatka z pomidorów",
        recipe: "1. Umyj i osusz pomidory. 2. Pokrój pomidory na plasterki. 3. Ułóż plasterki pomidorów na talerzu.",
        ingredients: { "pomidory": "200 g" },
        image: "https://via.placeholder.com/150"
      },
      {
        title: "Sałatka z pomidorów i jajek",
        recipe: "1. Umyj i osusz sałatę oraz pomidory. 2. Pokrój sałatę na mniejsze kawałki, pomidory na plasterki. 3. Ugotuj jajka na twardo, obierz i pokrój w plasterki. 4. Ułóż sałatę, pomidory i jajka na talerzu.",
        ingredients: { "sałata": "100 g", "pomidory": "200 g", "jajka": "2 sztuki" },
        image: "https://via.placeholder.com/150"
      },
      {
        title: "Sałatka z pomidorów, jajek i sera feta",
        recipe: "1. Umyj i osusz sałatę oraz pomidory. 2. Pokrój sałatę na mniejsze kawałki, pomidory na plasterki. 3. Ugotuj jajka na twardo, obierz i pokrój w plasterki. 4. Pokrój ser feta na kostki. 5. Ułóż sałatę, pomidory, jajka i ser feta na talerzu.",
        ingredients: { "sałata": "100 g", "pomidory": "200 g", "jajka": "2 sztuki", "ser feta": "50 g" },
        image: "https://via.placeholder.com/150"
      },
    ];
  
    axios.post.mockResolvedValue({
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
    });
  
    const res = await request(app)
      .post("/prepareRecipes")
      .send({ ingredients: sampleIngredients })
      .expect("Content-Type", /json/)
      .expect(200);
  
    expect(res.body).toEqual(sampleRecipes);
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
