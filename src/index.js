const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((users) => users.username === username);

  if (userAlreadyExists) {
    return response.status(400).send({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id: id_todo } = request.params;

  const todoToBeUpdate = user.todos.map((obj) => {
    if (obj.id === id_todo) {
      obj.title = title;
      obj.deadline = new Date(deadline);
    }

    return obj;
  });

  return response.status(200).json(todoToBeUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id: id_todo } = request.params;

  const todoToBeUpdate = user.todos.map((obj) => {
    if (obj.id === id_todo) {
      obj.done = true;
    }

    return obj;
  });

  return response.status(200).json(todoToBeUpdate);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id: id_todo } = request.params;

  const todos = user.todos;

  todos.splice(id_todo, 1);

  return response.status(200).send();
});

module.exports = app;
