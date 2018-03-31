const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require("lodash");
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');
//todo to provide async testing we use done argument 
//to tell mocha
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = 'This should be the new text';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var text = 'This should be the new text!!';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe("GET /user/me",()=>{
it("SHould return user if authenticated",(done)=>{
  request(app)
  .get("/users/me")
  .set("x-auth",users[0].tokens[0].token)//we use set method in order to set header in supertest
  .expect(200) 
  .expect((res)=>{
    
    expect(res.body._id).toBe(users[0]._id.toHexString());
    expect(res.body.email).toBe(users[0].email);
  })
  .end(done);
})
it("Should return 401 if user not found",(done)=>{
  request(app)
  .get("/users/me")
  .expect(401)
  .expect(res => {
    expect(res.body).toEqual({});//when comparing an empty object to 
    //antoher object we use toEqual
  })
  .end(done);
})
});

describe("POST /users" ,()=>{
it("should set up email and password with auth-x token",(done)=>{
  let email ="example@gmail.com";
  let password ="12345678";
  request(app)
  .post("/users")
  .send({email,password})
  .expect(200)
  .expect(res =>{
    expect(res.headers["x-auth"]).toExist();
    expect(res.body._id).toExist();
    expect(res.body.email).toBe(email);

  })
  .end((err)=>{
    if(err){
      done(err);
    }
    //fetch user from database and make some assertion
    User.findOne({email}).then(user =>{
      expect(user).toExist();
      expect(user.password).toNotBe(password);
      done();

    })
  });
})
it("should not create user with invalid detail",(done)=>{
  let email ="fjfj39js";
  let password ="12345678";
  request(app)
  .post("/users")
  .send({email,password})
  .expect(400)
  .end(done);
})
it("should not create user if its already exist",(done)=>{
let email = "jen@example.com";
let password = "userTwoPass";
request(app)
.post("/users")
.send({email,password})
.expect(400)
.expect(res =>{
  expect(res.body).toExist()
})
.end(done);
})
})

describe("POST users/login",()=>{
  it("should login user and return auth token",(done)=>{
  
    request(app)
    .post("/users/login")
    .send({email:users[1].email,password:users[1].password})
    .expect(200)
    .expect(res =>{
      expect(res.header["x-auth"]).toExist();
    })
    .end((err,res)=>{
      if(err){
        return done(err);
      }
     User.findById(users[1]._id).then(user =>{
    console.log(user.tokens[0])
       expect(user.tokens[0]).toInclude({
         access:"auth",
         tokens:res.header["x-auth"]
       });
       done();
     }).catch(e => done());
    });
 
  });
  it("Should reject invalid ",(done)=>{
    let email ="tushar@gmail.com";
    let password = "userpass";
    request(app)
    .post("/users/login")
    .send({email,password})
    .expect(400)
    .expect(res =>{
      expect(res.header["x-auth"]).toNotExist();
    })
    .end((err,res)=>{
      if(err){
        return done(err);
      }
     User.findOne({email}).then(user =>{
  if(!user){
    done();
  } }).catch(e => done(e));
    });
  
  });
});