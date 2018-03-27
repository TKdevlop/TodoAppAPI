let express = require("express");
let bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");

const {mongoose} = require("./db/mongoose");
let {Todo} = require("./models/todo");
let {User} = require("./models/users");
let port = process.env.PORT || 3000;
let app = express();
app.use(bodyParser.json());
app.post("/todos",(req,res)=>{
let todo = new Todo({text: req.body.text,
                     completed:req.body.completed,
                      completedAt:req.body.completedAt});
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
app.get("/todos/:id",(req,res) => {
let id = req.params.id
if(!ObjectID.isValid(id)){
  return res.status(404).send();
}
Todo.findById(id).then(todo => {
  if(!todo){
  res.status(404).send();
  }
  res.send({todo});
}).catch((err)=> res.status(400).send(err));
// res.send(id);
// Todo.findById(id).then((todo)=> res.send({todo}))
})
app.delete("/todos/:id",(req,res)=>{
let id = req.params.id
if(!ObjectID.isValid){
  return res.status(404).send("Invalid ObjectID");
}
Todo.findByIdAndRemove(id).then(todo => {
  if(!todo){
    res.status(404).send("No Todo was found by that ID");
  }
  res.send(`Deleted sucessfully ${JSON.stringify(todo)}`)
}).catch(e => res.send(e));
})

app.listen(port,() => {
  console.log(`Started up at port ${port}`);
});
module.exports = {
  app
}