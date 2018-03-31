require('./config/config');
//We use congfig js to set differnt port for dev,test,delop
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
//use object desctructing to pull out ObjectID from a file
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
const bcrypt = require("bcryptjs");
var app = express();
const port = process.env.PORT; //using process to get port

app.use(bodyParser.json()); 
//bodyParser will parser the body to set the content type 
//by using middleware. middleware are those which occur 
//between request and response 

//makeing a post request to get data from user for text and status
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    completed:req.body.completed,
    completedAt:req.body.completeAt
  });
//after getting the data using mongoose save() method 
//which return a promise and responding data back
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});
//makeing a get request to get the data and show every todo
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});
//by using req params property of req and findbyid method show that
//indiviual todo
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});
//deleteing a specifc todo by  using delete req and findbyidandremove method
//and req parmas to get id
app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});
// patch aka updating a specfic todo by changeing its completed and text status
//using lodash pick method to pull out required property from the lodash

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
//using mongoose $set property which is used update old property

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users 
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
 //only intance have access to the intance method;
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

//to get the specifc user and  use middleware to check if auth-x if you
//are a real user or not
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});
//case when the user exist but its token not available 
app.post("/users/login",(req,res)=>{
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email,body.password).then(user =>{
    return user.generateAuthToken().then(token =>{
      res.header("x-auth",token).send(user)
    })


    res.send(user);
  }).catch(e =>{
    res.status(400).send();
  })

})
app.delete("/users/me/token",authenticate,(req,res)=>{
req.user.removeToken(req.token) .then(()=>{
res.status(200).send();
}).catch(() => res.status(400).send())
})//once we are authenticated we have access the the user
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
