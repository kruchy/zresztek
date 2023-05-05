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
    const timerInterval = startTimer(); 
    try {
      const response = await fetch(`${process.env.REACT_APP_API_PATH}/prepareRecipes`, {
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
        <div className="error-notification" style={notificationStyle}>
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
      {loading && (
        <div className="spinner-container" style={spinnerContainerStyle}>
          <CircularProgress />
          <div className="timer" style={timerStyle}>
            Czas oczekiwania: {timer} sekund
          </div>
          {timer >= 20 && (
            <div className="wait-message" style={waitMessageStyle}>
              To może potrwać, ale będzie warto!
            </div>
          )}
        </div>
      )}
      <div className="recipes-container" style={recipesContainerStyle}>
        {recipes.map((recipe, index) => (
          <div key={index} className="recipe" style={recipeStyle}>
            <div>
              <h2>{recipe.title}</h2>
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

const recipesContainerStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
};

const recipeStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  margin: "20px",
  width: "100%",
  maxWidth: "400px", 
  border: "1px solid #ccc",
  borderRadius: "5px",
  padding: "15px",
  backgroundColor: "white",
};


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

const spinnerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
};

const timerStyle = {
  marginTop: "10px",
  fontSize: "16px",
};

const waitMessageStyle = {
  marginTop: "10px",
  fontSize: "16px",
  fontStyle: "italic",
};

export default App;
