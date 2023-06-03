import React, { useState } from "react";
import "./App.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import knownIngredients from "./ingredients";

const StyledAutocomplete = (props) => (
  <Autocomplete className="styled-autocomplete" {...props} />
);

const StyledTextField = (props) => (
  <TextField className="styled-textfield" {...props} />
);

const Logo = () => (
  <Box className="logo" data-testid="Logo" />
);

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [lastSearchedIngredients, setLastSearchedIngredients] = useState([]);
  const [useOnlySelected, setUseOnlySelected] = useState(false);

  const handleSearchRecipes = async () => {
    try {
      setRecipes([])
      setError(null)
      setLastSearchedIngredients(ingredients);
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/prepareRecipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients, useOnlySelected }),
      });

      const eventSource = new EventSource(`${process.env.REACT_APP_API_PATH}/prepareRecipes`);

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        setError("Wystąpił chwilowy błąd. Spróbuj ponownie później.");
        eventSource.close();
      };
      eventSource.addEventListener('DONE', function (event) {
        console.log('DONE event received');
        eventSource.close();
      });
      eventSource.onmessage = (event) => {
        try {
          console.log("Received event:", event);
          const data = JSON.parse(event.data);
          console.log("Parsed data:", data);
          setRecipes(prevRecipes => [...prevRecipes, data]);
        } catch (error) {
          console.error("Failed to parse event data:", error);
        }
      };
    } catch (error) {
      setError("Wystąpił chwilowy błąd. Spróbuj ponownie później.");
      console.error(error);
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

      {recipes.length > 0 && (<div className="recipes-container" >
        <pre className="recipe">{recipes}</pre>
      </div>)}
    </div>
  );
}

export default App;
