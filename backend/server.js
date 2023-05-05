require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const errorHandling = require("./middlewares/errorHandler");
const asyncErrorHandler = require("./middlewares/asyncErrorHandler");
const prepareRecipesHandler = require("./prepareRecipes");

app.use(cors());

app.use(errorHandling);

app.post("/api/prepareRecipes", asyncErrorHandler(prepareRecipesHandler));

app.listen(port, () => {
  console.log(`Zresztek app listening on port ${port}`);
});
