let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI
);
// mongoose.connection.on('open', function() {
//     mongoose.connection.db.admin().serverStatus(function(error, info) {
//       console.log(info.version);
//     });
//   });

module.exports = {mongoose};
