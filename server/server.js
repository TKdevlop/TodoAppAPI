let express = require("express");
let bodyParser = require("body-parser");

const {mongoose} = require("./db/mongoose");
let {Todo} = require("./models/todo");
let {User} = require("./models/users");

let app = express();
app.use(bodyParser.json());
app.post("/todos",(req,res)=>{
let todo = new Todo({text: req.body.text});
todo.save().then((doc) => {
  res.send(doc);
},(e)=> {
  res.status(400).send(e);
})
});
app.get("/todos",(req,res) => {
Todo.find().then((todos)=>{
res.send({todos}); // sending back array is not good apporach rather send property so later on we can change it
},(err)=>{
  res.status(400).send(e);
})
})
app.listen(3000,() => {
  console.log("Running on port 3000!");
});
module.exports = {
  app
}