import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import App from "./App";

describe("App", () => {
  test("renders RecipeMan header", () => {
    act(() => {
      render(<App />);
    });
    const headerElement = screen.getByTestId(/Logo/i);
    expect(headerElement).toBeInTheDocument();
  });

  test("renders error message when request fails", async () => {
    jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.reject("Error fetching data"));

    await act(async () => {
      render(<App />);
    });
    await act(async () => {
      const searchButton = screen.getByText(/Szukaj przepisów/i);
      fireEvent.click(searchButton);
    });

    await waitFor(() =>
      expect(screen.getByText(/Wystąpił chwilowy błąd./i)).toBeInTheDocument()
    );

    global.fetch.mockRestore();
  });

  test("renders recipes when request is successful", async () => {
    const mockRecipes =  [
      {
          "title": "Title 1",
          "recipe": "Recipe 1",
          "ingredients": [
              {
                  "ingredient": "ingredient1",
                  "quantity": "150g"
              },
              {
                  "ingredient": "ingredient2",
                  "quantity": "1 łyżeczka"
              }
          ]
      },
      {
          "title": "Title 2",
          "recipe": "Recipe 2",
          "ingredients": [
              {
                  "ingredient": "ingredient1",
                  "quantity": "150g"
              },
              {
                  "ingredient": "ingredient2",
                  "quantity": "1 łyżeczka"
              }
          ]
      },
      {
          "title": "Title 3",
          "recipe": "Recipe 3",
          "ingredients": [
              {
                  "ingredient": "ingredient1",
                  "quantity": "150g"
              },
              {
                  "ingredient": "ingredient2",
                  "quantity": "1 łyżeczka"
              }
          ]
      }
  ];

    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRecipes),
      })
    );

    await act(async () => {
      render(<App />);
    });
    await act(async () => {
      const searchButton = screen.getByText(/Szukaj przepisów/i);
      fireEvent.click(searchButton);
    });
    await waitFor(() =>
      expect(screen.getByText(/Recipe 1/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Recipe 2/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Recipe 3/i)).toBeInTheDocument()
    );

    global.fetch.mockRestore();
  });
});
