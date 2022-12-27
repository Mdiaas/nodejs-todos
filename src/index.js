const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username);

  if(!user){
    return response.status(400).send({
        'error': 'not found'
    })
  }
  request.user = user
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  
  const userAlreadyExists = users.some(user => user.username === username)
  if(userAlreadyExists){
    return response.status(400).send({
        error: 'User already exists'
    });
  }
  const user = {
    name, 
    username,
    id: uuidv4(),
    todos: []
  }
  users.push(user);
  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo= { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  user.todos.push(todo)
  return response.status(201).send()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params
  const todo = user.todos.find((todo) => todo.id == id)
  if(!todo){
    return response.json({
      "error": "Todo not found"
    })
  }
  todo.title = title
  todo.deadline = deadline

  return response.status(201).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todo = user.todos.find((todo) => todo.id == id)
  if(todo)
    todo.done = true
  else {
    return response.json({
      "error": "Todo not found"
    })
  }
  return response.status(201).send()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todoIndex = user.todos.findIndex((todo) => todo.id == id)
  user.todos.splice(todoIndex, 1)
  return response.status(201).send()
});

app.listen(3000);
module.exports = app;