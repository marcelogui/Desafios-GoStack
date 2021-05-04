import React, { useState, useEffect } from "react";

import api from "./services/api";

import "./styles.css";

function App() {

  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    api.get('repositories').then(response => {
        setRepositories(response.data);
      })
  }, [])

  async function handleAddRepository() {
    const response = await api.post('repositories', {
      url: "http://github.com",
      title: "ReactJS for begginers",
      techs: ["JavaScript", "ReactJS", "Node.js"],
    });

    const repository = response.data;
    setRepositories([...repositories, repository]);
  }

  async function handleRemoveRepository(id) {
    const repositoryIndex = repositories.findIndex((element) => {
      return element.id === id;
    });

    const newRepositories = [...repositories]
    newRepositories.splice(repositoryIndex, 1);
    setRepositories(newRepositories);
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repositories.map((repository) => (
          <li key={repository.id}>
            {repository.title}

            <button onClick={() => handleRemoveRepository(repository.id)}>
              Remover
            </button>
          </li>

        ))}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
