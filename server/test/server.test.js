const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
 Todo.insertMany(todos);
 done();
  },e => console.log(e));
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'new todo here';

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

  it('should return 404 for non-object id', (done) => {
    request(app)
      .get('/todos/123abc')
      .expect(404)
      .end(done);
  });
});

describe("DELTE/todos/:id",()=>{
it("should Delete a Todo",(done)=>{
  let hexId = todos[1]._id.toHexString();
  console.log(hexId);
  request(app)
  .delete(`/todos/${hexId}`)
  .expect(200)
  .expect((res)=>{
    console.log(res);
   
  expect(res.body.todo._id).toBe(hexId);
  })
  .end((err,res)=>{
    if(err){
      return done(err);
    }
    Todo.findById(hexId).then((todo)=>{
      expect(todo).toNotExist();
    }).catch(e => done(e))

  })
  
})
it("should return 404 if todo was not found",(done)=>{
  request(app)
  .delete('/todos/123abc')
  .expect(404)
  .end(done);
})
it("should return 404 if objectID is invalid",(done)=>{
  request(app)
  .get('/todos/123abc')
  .expect(404)
  .end(done);
})
})