var mongoose = require('mongoose');
//setting up databsse and promise to golbal as mongoose 
//don't use global promise it's uses bluebird
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
