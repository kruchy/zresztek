import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import App from "./App";

import { EventEmitter } from 'events';

global.EventSource = class EventSource extends EventEmitter {
  constructor() {
    super();
    // Simulate the behavior of an EventSource connection: emit events asynchronously
    process.nextTick(() => {
      this.emit('message', {
        data: JSON.stringify(`
      Tarta z ananasem

      Składniki:
      - 1 ananas (średniej wielkości)
      - 200 g mąki pszennnej
      - 100 g masła
      - 50 g cukru pudru
      - 1 jajko
      - 1 łyżka ekstraktu waniliowego
      - 1 łyżeczka proszku do pieczenia
      - szczypta soli
      - 1 łyżka oleju (do posmarowania formy)

      Kroki:
      1. Obierz ananasa, usuń środek i pokrój w cienkie plastry.
      2. Rozgrzej piekarnik do 180 stopni Celsjusza.
      3. W misce wymieszaj mąkę, sól i proszek do pieczenia.
      4. Dodaj pokrojone w kostkę masło, cukier puder, jajko i ekstrakt waniliowy, a następnie zagnieć ciasto na jednolitą konsystencję.
      5. Posmaruj formę do tarty olejem.
      6. Rozłóż ciasto na dnie formy, tworząc również brzegi.
      7. Ułóż plastry ananasa na cieście, tworząc wzór według uznania.
      8. Piecz tartę w piekarniku przez 30-35 minut, aż ciasto będzie złociste.
      9. Wyjmij z piekarnika i pozostaw do ostygnięcia przed podaniem.
      `)
      });
      this.emit('DONE', {});
    });
  }
  addEventListener() { /* ... */ }
  removeEventListener() { /* ... */ }
  close() { /* ... */ }
};

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

  test.skip("renders recipes when request is successful", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
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
      expect(screen.getByText(/Tarta z ananasem/i)).toBeInTheDocument()
    );


    global.fetch.mockRestore();
  });
});