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
    const headerElement = screen.getByText(/RecipeMan/i);
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
    const mockRecipes = [
      {
        title: "Recipe 1",
        image: "https://via.placeholder.com/150",
        description: "A delicious recipe using ingredients 1, 2, and 3.",
      },
      {
        title: "Recipe 2",
        image: "https://via.placeholder.com/150",
        description: "A fantastic recipe using ingredients 1, 4, and 5.",
      },
      {
        title: "Recipe 3",
        image: "https://via.placeholder.com/150",
        description: "An amazing recipe using ingredients 2, 3, and 6.",
      },
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
