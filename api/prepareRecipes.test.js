// server.test.js
import axios from "axios";
import request from "supertest";
import express from "express";
import cors from "cors";
import { json } from "express";
import { post } from "axios";
import { generateRecipesHandler, server } from "./server";
jest.mock("axios");

describe("Server API", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(cors());
    app.use(json());
    app.post("/generateRecipes", generateRecipesHandler);
  });

  afterEach(() => {
    server.close();
  });

  it("generateRecipes returns generated recipes", async () => {
    const sampleIngredients = ["potatoes", "onions", "carrots"];
    const sampleRecipes = [
      {
        title: "Potato Soup",
        description: "A delicious potato soup",
        image: "https://via.placeholder.com/150",
      },
      {
        title: "Onion Soup",
        description: "A delicious onion soup",
        image: "https://via.placeholder.com/150",
      },
    ];

    axios.post.mockResolvedValue({
      data: {
        choices: [
          { text: "Potato Soup\nA delicious potato soup" },
          { text: "Onion Soup\nA delicious onion soup" },
        ],
      },
    });

    const res = await request(app)
      .post("/generateRecipes")
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
      .post("/generateRecipes")
      .send({ ingredients: sampleIngredients })
      .expect("Content-Type", /json/)
      .expect(500);

    expect(res.body).toEqual({ message: errorMessage });
  });
});
