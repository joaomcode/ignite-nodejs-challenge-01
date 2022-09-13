const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [
  {
    "id": "a7056a47-1693-422c-b307-b0abd799f6c1",
    "name": "Jon",
    "username": "jonas1",
    "todos": [
      {
        "id": uuidv4(),
        "title": "Nome da tarefa",
        "done": false,
        "deadline": new Date(),
        "created_at": new Date()
      }
    ]
  },
  {
    "id": "b582aa9f-9efb-4489-a980-9eb2bb3f8d71",
    "name": "Jon",
    "username": "jonas2",
    "todos": []
  }
];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'Mensagem do erro' })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username)

  if (userExists) return response.status(400).json({ error: 'Username já existe' })

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/users', (request, response) => {

  const header = request.params;

  return response.send(header)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.send(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const { todos } = request.user;

  const todoExists = todos.find(todos => todos.id === todoId)

  if (!todoExists) return response.status(404).json({ error: 'Todo não existe' })

  const { title, deadline } = request.body;

  todoExists.title = title;
  todoExists.deadline = new Date(deadline);

  return response.send(todoExists);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const { todos } = request.user;

  const todoExists = todos.find(todos => todos.id === todoId);
  
  if (!todoExists) return response.status(404).json({ error: 'Todo não existe' });
  
  todoExists.done = true;
  
  return response.send(todoExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const { todos } = request.user;

  const todoExists = todos.find(todos => todos.id === todoId);
  
  if (!todoExists) return response.status(404).json({ error: 'Todo não existe' });
  
  const indexOfTodo = todos.findIndex(todos => todos.id === todoId);

  todos.splice(indexOfTodo, 1);

  return response.status(204).json(todos);
});

module.exports = app;