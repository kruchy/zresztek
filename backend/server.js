require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const errorHandling = require("./middlewares/errorHandler");
const asyncErrorHandler = require("./middlewares/asyncErrorHandler");
const prepareRecipesHandler = require("./prepareRecipes");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(errorHandling);

app.get("/commitSha", (req, res) => {
  const contentToDisplay = `
SHA: ${process.env.GIT_LAST_COMMIT_SHA || "Unknown commit sha"}
LAST DEPLOY TIME: ${process.env.DEPLOY_TIME || "Unknown commit sha"}
`;
  return res.send();
});

app.get("/healthCheck", (req, res) => res.send("Health Check OK"));

app.post("/api/prepareRecipes", asyncErrorHandler(prepareRecipesHandler));

app.listen(port, () => {
  console.log(`Zresztek app listening on port ${port}`);
});
