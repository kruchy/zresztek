import prepareRecipes from "./prepareRecipes";
const devResponse = require("./response.json");

jest.mock("axios");

describe("Server API", () => {
  it("generateRecipes returns generated recipes", async () => {
    const sampleIngredients = ["amaretto", "ananas", "awokado"];

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

    await prepareRecipes(reqMock, resMock);

    expect(json).toBeCalledTimes(1);
    expect(json).toBeCalledWith(devResponse.choices[0].message.content);
    expect(status).toBeCalledTimes(1);
    expect(status).toBeCalledWith(200);
  });

  it("generateRecipes returns 500 when ingredients from request are not valid", async () => {
    const sampleIngredients = ["pokrzywa", "ananas", "awokado"];
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

    await prepareRecipes(reqMock, resMock);

    expect(json).toBeCalledTimes(1);
    expect(json).toBeCalledWith({
      message: "Failed to generate recipes",
    });
    expect(status).toBeCalledTimes(1);
    expect(status).toBeCalledWith(500);
  });
});
