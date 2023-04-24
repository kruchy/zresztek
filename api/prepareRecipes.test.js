import axios from "axios";
import prepareRecipes from "./prepareRecipes";
jest.mock("axios");

describe("Server API", () => {
  it("generateRecipes returns generated recipes", async () => {
    const sampleIngredients = ["potatoes", "onions", "carrots"];

    const json = jest.fn();
    const status = jest.fn().mockImplementation(() => ({
      json,
    }));
    const reqMock = {
      body: {
        ingredients: sampleIngredients,
      },
    };

    const resMock = {
      status,
      json,
    };

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

    await prepareRecipes(reqMock, resMock);

    expect(json).toBeCalledTimes(1);
    expect(json).toBeCalledWith(sampleRecipes);
    expect(status).toBeCalledTimes(1);
    expect(status).toBeCalledWith(200);
  });

  it("generateRecipes returns 500 when API request fails", async () => {
    const sampleIngredients = ["potatoes", "onions", "carrots"];
    const errorMessage = "Failed to generate recipes";

    const json = jest.fn();
    const status = jest.fn().mockImplementation(() => ({
      json,
    }));
    const reqMock = {
      body: {
        ingredients: sampleIngredients,
      },
    };

    const resMock = {
      status,
      json,
    };

    axios.post.mockRejectedValue(new Error(errorMessage));

    await prepareRecipes(reqMock, resMock);

    expect(json).toBeCalledTimes(1);
    expect(json).toBeCalledWith({
      message: "Failed to generate recipes",
      error: new Error("Failed to generate recipes"),
    });
    expect(status).toBeCalledTimes(1);
    expect(status).toBeCalledWith(500);
  });
});
