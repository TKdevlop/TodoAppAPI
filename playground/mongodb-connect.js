// const MongoClient = require("mongodb").MongoClient;
const {MongoClient, ObjectID} = require("mongodb");
// let obj = new ObjectID();
// console.log(obj);

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err,db) => {

  if(err){
     return console.log("Unable to connect to the server");
  }
  console.log("Connected to the mongodb Server");
  db.collection("Todos").find({name:"tushar"}).toArray().then((arr) => {
 console.log(JSON.stringify(arr,null,2));
},(err) => {
  console.log(err);
}
)
//   db.collection("Todos").find({
// _id:new ObjectID("5ab3b97e10c5e00a804f19fb")
//   }).toArray().then((doc) => {
//     console.log("Todos");
//         console.log(JSON.stringify(doc,null,2));
//   },(e) =>{
//     console.log(e);
//   })
  // db.collection("Todos").find().count().then((count) => {
  //   console.log(`Todos : ${count}`);
  //
  // },(e) =>{
  //   console.log(e);
  // })

  // if(err){
  //   return console.log("Cannot connect to the Datebase");
  // }
  // console.log("Sucessfully connected to the Database");
  // db.collection("Users").insertOne({
  //   name:"tushar",
  //   age:18,
  //   location:"dehradun"
  // },(err,result) => {
  //   if(err){
  //     return console.log("Cannot Add to the Database");
  //   }
  //   console.log(JSON.stringify(result.ops,null,2));
  // })

  db.close();
})
