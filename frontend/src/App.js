import React, { useState, useEffect } from "react";
import "./App.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import knownIngredients from "./ingredients";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "./img/cover.png"


const StyledAutocomplete = styled(Autocomplete)`
  width: 100%;
  max-width: 500px;
`;

const StyledTextField = styled(TextField)`
  width: 100%;
`;

const Logo = styled(Box)`
  background-image: url(${Image});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  max-width: 500px;
  height: 200px;
  margin: 10px auto;
`;

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [lastSearchedIngredients, setLastSearchedIngredients] = useState([]);
  const [recipesNumber, setRecipesNumber] = useState(3);
  const [useOnlySelected, setUseOnlySelected] = useState(false);

  const startTimer = () => {
    return setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSearchRecipes = async () => {
    setLoading(true);
    setLastSearchedIngredients(ingredients);
    const timerInterval = startTimer();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/prepareRecipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients, recipesNumber, useOnlySelected }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipes");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error(error);
      setError("Wystąpił chwilowy błąd. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
      clearInterval(timerInterval);
      setTimer(0);
    }
  };

  return (
    <div className="App">
      <Logo data-testid="Logo" />
      {error && (
        <div className="notification" >
          {error}
        </div>
      )}
      <div className="search-container">
        <StyledAutocomplete
          multiple
          options={knownIngredients}
          onChange={(event, value) => setIngredients(value)}
          renderInput={(params) => (
            <StyledTextField
              {...params}
              variant="outlined"
              label="Wprowadź składniki"
            />
          )}
        />

        <button onClick={handleSearchRecipes}>Szukaj przepisów</button>
      </div>
      <div className="recipes-customization-container">
        {/* <div className="recipes-number-container">
          <label htmlFor="recipes-number">Wybór liczby przepisów:</label>
          <select
            id="recipes-number"
            value={recipesNumber}
            onChange={(event) => setRecipesNumber(event.target.value)}
          >
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div> */}
        {/* Dodajemy pole "Użyj tylko wybranych składników" */}
        <div className="use-only-selected-container">
          <label htmlFor="use-only-selected">Użyj tylko wybranych składników:</label>
          <input
            id="use-only-selected"
            type="checkbox"
            checked={useOnlySelected}
            onChange={(event) => setUseOnlySelected(event.target.checked)}
          />
        </div>
      </div>
      {lastSearchedIngredients.length > 0 && (
        <div className="selected-ingredients-container">
          <div className="selected-ingredients">
            <strong>Wybrane składniki:</strong>{" "}
            {lastSearchedIngredients.map((ingredient, index) => (
              <span key={index} className="ingredient">
                {ingredient}
                {index < lastSearchedIngredients.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      )}
      {loading && (
        <div className="spinner-container">
          <CircularProgress />
          <div className="timer" >
            Czas oczekiwania: {timer} sekund
          </div>
          {timer >= 20 && (
            <div className="wait-message" >
              Trwa generowanie przepisów, to może chwilkę potrwać!
            </div>
          )}
        </div>
      )}
      <div className="recipes-container" >
        {recipes.map((recipe, index) => (
          <div key={index} className="recipe" >
            <div>
              <h2>{recipe.title}</h2>
              {recipe.image && <img src={recipe.image} alt={recipe.title} className="image" />}
              <div>
                {recipe.recipe.map((step, stepIndex) => (
                  <p key={stepIndex}>{step}</p>
                ))}
              </div>
              <ul>
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i}>
                    {ingredient.ingredient}: {ingredient.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
