const express = require("express");
const cors = require("cors");
const { v4: uuid, validate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isValidID(request, response, next){
  const { id } = request.params;

  if(!validate(id)){
    return response.status(400).json({error: "Invalid repository."});
  }

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0){
    return response.status(400).json({error: "Repository not found."});
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const id = uuid();
  const new_repository = {
    id,
    url,
    title,
    techs,
    likes: 0
  }
  repositories.push(new_repository);
  response.status(201).json(new_repository);

});

app.put("/repositories/:id", isValidID, (request, response) => {
  const { id } = request.params;
  const { title, url, techs} = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id );

  const oldLikes = repositories[repositoryIndex].likes;
  const updatedRepository = {
    id,
    url,
    title,
    techs,
    likes: oldLikes
  };

  repositories[repositoryIndex] = updatedRepository;
  return response.json(updatedRepository);

});

app.delete("/repositories/:id", isValidID, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id );

  repositories.splice(repositoryIndex, 1);
  return response.status(204).send()
});

app.post("/repositories/:id/like", isValidID, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id );

  repositories[repositoryIndex].likes++;
  return response.json(repositories[repositoryIndex]);

});

module.exports = app;
