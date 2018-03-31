var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
// Compact: Because of their smaller size, 
// JWTs can be sent through a URL, POST parameter, 
// or inside an HTTP header. Additionally, 
// the smaller size means transmission is fast.

// Self-contained: The payload contains all the 
// required information about the user, avoiding the
//  need to query the database more than once.
// xxxxx.yyyyy.zzzzz
//header aka algorithm such as SHA256,RSA:: payload aka cntent