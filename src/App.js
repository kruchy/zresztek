import React, { useState, useEffect } from "react";
import "./App.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const knownIngredients = [
  "jajko",
  "mąka",
  "cukier",
  "sól",
  "pieprz",
  // Dodaj więcej znanych składników tutaj...
];

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSearchRecipes = async () => {
    try {
      const response = await fetch(`${process.env.API_PATH}/generateRecipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipes");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error(error);
      setError("Wystąpił chwilowy błąd. Spróbuj ponownie później.");
    }
  };

  return (
    <div className="App">
      {error && (
        <div className="error-notification" style={notificationStyle}>
          {error}
        </div>
      )}
      <h1>RecipeMan</h1>
      <div className="search-container">
        <Autocomplete
          multiple
          options={knownIngredients}
          onChange={(event, value) => setIngredients(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Wprowadź składniki"
            />
          )}
        />
        <button onClick={handleSearchRecipes}>Szukaj przepisów</button>
      </div>
      <div className="recipes-container">
        {recipes.map((recipe, index) => (
          <div key={index} className="recipe">
            <img src={recipe.image} alt={recipe.title} />
            <div>
              <h2>{recipe.title}</h2>
              <p>{recipe.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const notificationStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  backgroundColor: "rgba(255, 0, 0, 0.8)",
  padding: "10px",
  borderRadius: "5px",
  zIndex: 1000,
  color: "white",
};

export default App;
