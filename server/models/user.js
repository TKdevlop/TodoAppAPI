const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


//makeing function costructor by using new mongoose.Schema
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    } 
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    },
    
  
  }]
},{
  usePushEach: true
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};
UserSchema.methods.removeToken = function(token){
let user = this;

 return user.update({
  $pull:{ //pull remove the entire property if it match the certain ceitira 
    tokens:{
      token
    }
  }
});
}

UserSchema.methods.generateAuthToken = function () {

  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function(email,password){
  let User = this;
  return User.findOne({email}).then(user =>{
    if(!user){
      return Promise.reject();
    }
   return bcrypt.compare(password,user.password).then(res => {
      if(!res){
          return Promise.reject()
      }
    //   if(!user.tokens[0]){
    //  return  user.generateAuthToken() + "Token sucessfully Created";
    //   }
      else{
        return user
      }
    })
    .catch(e => res.status(400).send({}))
  })
  }
UserSchema.pre('save', function (next) {
  var user = this;



  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User}
