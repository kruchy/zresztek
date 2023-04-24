require("dotenv").config();
const devResponse = require("./response.json")

const axios = require("axios");

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

console.log(process.env.DEV_ENABLED)

async function createChatCompletion(messages, options = {}) {
  try {
    const response = await openai.post("/chat/completions", {
      model: options.model || "gpt-3.5-turbo",
      messages,
      ...options,
    });

    return response.data.choices;
  } catch (error) {
    console.error("Error creating chat completion:", error);
  }
}

module.exports =  async function prepareRecipesHandler(req, res) {
  try {
    if(req.body && req.body.ingredients.length === 0){
      throw new Error('Ingredients are empty');
    }
    const ingredients = req.body.ingredients;
    

    // const messages = [
    //   { role: "user", content: `${process.env.RECIPE_PROMPT}: ${ingredients.join(", ")}`, },
    // ];

    // const options = {
    //   temperature: 0.8,
    //   max_tokens: 3000,
    // };

    // const choices = await createChatCompletion(messages, options);

    const response = process.env.DEV_ENABLED ? { data: devResponse } : await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [ 
          {content: `${process.env.RECIPE_PROMPT}: ${ingredients.join(", ")}`,
          role: "system"}
        ],
        max_tokens: 3000,
        n: 1,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // const response =  {
    //   "data": {
    //     "id": "chatcmpl-78pVRBlDIzQpU7fLPohFZeaw6aD8c",
    //     "object": "chat.completion",
    //     "created": 1682338969,
    //     "model": "gpt-3.5-turbo-0301",
    //     "usage": {
    //       "prompt_tokens": 267,
    //       "completion_tokens": 860,
    //       "total_tokens": 1127
    //     },
    //     "choices": [
    //       {
    //         "message": {
    //           "role": "assistant",
    //           "content": "[\n{\n\"title\": \"Sałatka z cebulą i pomidorem\",\n\"recipe\": \"1. Pokrój cebulę i pomidora w kostkę. \\n2. Połącz cebulę i pomidora w misce. \\n3. Dopraw solą, pieprzem i oliwą. \\n4. Podawaj z sałatą.\",\n\"ingredients\": [\n{\"cebula\": \"1 sztuka\"},\n{\"pomidor\": \"1 sztuka\"},\n{\"sól\": \"do smaku\"},\n{\"pieprz\": \"do smaku\"},\n{\"oliwa\": \"1 łyżka\"}\n]\n},\n{\n\"title\": \"Zupa brokułowo-kalafiorowa\",\n\"recipe\": \"1. Pokrój brokuł i kalafior na mniejsze kawałki. \\n2. W garnku rozgrzej oliwę, dodaj cebulę i podsmaż przez około 5 minut. \\n3. Dodaj brokuł i kalafior, zalej wodą i doprowadź do wrzenia. \\n4. Gotuj na wolnym ogniu przez około 20 minut. \\n5. Zmiksuj zupę na gładki krem. \\n6. Podawaj z grzankami.\",\n\"ingredients\": [\n{\"cebula\": \"1 sztuka\"},\n{\"brokuł\": \"1/2 sztuki\"},\n{\"kalafior\": \"1/2 sztuki\"},\n{\"woda\": \"500 ml\"},\n{\"oliwa\": \"1 łyżka\"},\n{\"grzanki\": \"do podania\"}\n]\n},\n{\n\"title\": \"Klopsiki z warzywami\",\n\"recipe\": \"1. W misce wymieszaj mięso mielone z cebulą i jajkiem. \\n2. Dodaj starty na tarce kalafior i brokuł, dopraw solą i pieprzem. \\n3. Formuj klopsiki i układaj na blasze do pieczenia. \\n4. Piecz w piekarniku nagrzanym do 180 stopni przez około 20 minut. \\n5. Podawaj z ugotowanymi warzywami.\",\n\"ingredients\": [\n{\"cebula\": \"1 sztuka\"},\n{\"brokuł\": \"1/2 sztuki\"},\n{\"kalafior\": \"1/2 sztuki\"},\n{\"mięso mielone\": \"300 g\"},\n{\"jajko\": \"1 sztuka\"},\n{\"sól\": \"do smaku\"},\n{\"pieprz\": \"do smaku\"},\n{\"warzywa\": \"do podania\"}\n]\n},\n{\n\"title\": \"Ratatouille z dodatkiem pomidorów\",\n\"recipe\": \"1. Cebulę pokrój w kostkę, a papryki w paski. \\n2. Na patelni rozgrzej oliwę i dodaj cebulę, smaż przez około 5 minut. \\n3. Dodaj papryki i smaż przez kolejne 5 minut. \\n4. Dodaj pokrojone w kostkę pomidory i smaż przez około 10 minut, aż pomidory się rozpadną. \\n5. Dopraw solą, pieprzem i ziołami prowansalskimi. \\n6. Podawaj z ryżem.\",\n\"ingredients\": [\n{\"cebula\": \"1 sztuka\"},\n{\"papryka\": \"2 sztuki\"},\n{\"pomidor\": \"2 sztuki\"},\n{\"oliwa\": \"1 łyżka\"},\n{\"sól\": \"do smaku\"},\n{\"pieprz\": \"do smaku\"},\n{\"zioła prowansalskie\": \"1 łyżeczka\"},\n{\"ryż\": \"do podania\"}\n]\n}\n]"
    //         },
    //         "finish_reason": "stop",
    //         "index": 0
    //       }
    //     ]
    //   }
    // };
    console.log(response)
        
    console.log(JSON.stringify(response.data))

    const resultResponse = process.env.DEV_ENABLED ? response.data.choices[0].message.content : JSON.parse(response.data.choices[0].message.content) 

    const generatedRecipes = resultResponse.map((choice) => {
      const recipe = choice.recipe;
      const title = choice.title;
      const ingredients = choice.ingredients;
      const image = "https://via.placeholder.com/150"
      return {
        title,
        recipe,
        ingredients,
        image
      };
    });

    res.status(200).json(generatedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate recipes"});
  }
}


