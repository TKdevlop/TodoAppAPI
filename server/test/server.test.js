const request = require("supertest");
const expect = require("expect");

let {Todo} = require("./../models/todo");
let {app} =  require("./../server");


beforeEach((done) => {
    Todo.remove({}).then(() => done());
})
describe("POST/Todos",() => {
it("should create a new todo",(done) => {
let text = "Test for test app";
request(app)
.post("/todos")
.send({text})
.expect(200)
.expect((res)=> {
    expect(res.body.text).toBe(text)
})
.end((err,res) => {
    if(err){
      return  done(err);
    }
    Todo.find().then((todo)=>{
    expect(todo.length).toBe(1);
    expect(todo[0].text).toBe(text);
    done();
    }).catch(e => done(e));
})
})
it("Should not create todo with invalid data", (done) =>{
request(app)
.post("/todos")
.send({})
.expect(400)
.end((err,res) => {
    if(err){
        return done(err);
    }
    Todo.find().then((todo)=> { //find fetch every single todo form the collection
        expect(todo.length).toBe(0);
        done();
    }).catch(e => done(e));
});
}
);
});