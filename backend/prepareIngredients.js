const knownIngredients = require("./ingredients");


module.exports = async function prepareRecipesHandler(req, res, tempIngredientsStorage) {

    if (req.body && req.body.ingredients.length === 0) {
        throw new Error("Ingredients are empty");
    }
    const ingredients = req.body.ingredients;
    const areIngredientsValid = ingredients.every((ingredient) =>
        knownIngredients.includes(ingredient)
    );

    if (!areIngredientsValid) {
        throw new Error("Invalid ingredient(s) detected");
    }
    const useOnlySelected = req.body.useOnlySelected || false

    tempIngredientsStorage[req.ip] = { ingredients, useOnlySelected };

    // Send a success response
    console.log(tempIngredientsStorage)
    res.status(200).json({ message: "Ingredients received" });


}