var env = process.env.NODE_ENV || 'development';
//using envirment variable which is avliable when node app start
//setting up our local,devlopment and testing envirment
if (env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
