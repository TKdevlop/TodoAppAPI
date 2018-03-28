require("./config/config.js");
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {
  ObjectID
} = require('mongodb');

let {
  mongoose
} = require('./db/mongoose');
let {
  Todo
} = require('./models/todo');
let {
  User
} = require('./models/user');

let app = express();
const port = process.env.PORT || 3000;
//body parser for JSON
app.use(bodyParser.json());
//post request to add new todo in API 
app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    completed:req.body.completed,
    completedAt:req.body.completedAt
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});
//get request to get all todo in thee API
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send(e);
  });
});
//get request for to get a specific todo in thee API
app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({
      todo
    });
  }).catch((e) => {
    res.status(400).send();
  });
});
//delete request to delete By a specific ID
app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({
      todo
    });
  }).catch((e) => {
    res.status(400).send();
  });
});
//Updating a specfic todo path
app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {
    $set: body
  }, {
    new: true
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send("Todo not found");
    }

    res.send({
      todo
    });
  }).catch((e) => {
    res.status(400).send();
  })
});
//adding user and authi
app.post("/users",(req,res)=>{
  let body = _.pick(req.body,["email","password"]);

  let user = new User({
    email:body.email,
    password:body.password
  });
  user.save().then(() => {
 return user.generateAuthToken();  
  }).then(token => {
res.header("x-auth",token).send(user);
  }).catch(e => res.send(e));
})
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {
  app
};