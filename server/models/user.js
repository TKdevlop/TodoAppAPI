

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const _ = require("lodash");
let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique:true,
    validate:{
      validator:validator.isEmail,
      message:`{VALUE} is not valid Email`
    }
  },
  password:{
    type:String,
    required:true,
    minlength:6
  },
  tokens:[{
    
    access:{
     type:String,
     required:true
    },
    token:{
      type:String,
      required:true
    }
  }]
},
)
UserSchema.methods.toJSON = function(){
  let user = this;
  let userObject = user.toObject()
  return _.pick(userObject,["_id","email"]);
}
UserSchema.methods.generateAuthToken=function (){
let user = this;
let access =  "auth";
let token = jwt.sign({_id:user._id.toHexString(),access},"123abc").toString();
user.tokens.push({access,token}); // to order all server js to chain it we return
return user.save().then(() =>{
  return token;
});
};
UserSchema.statics.findByToken=function(token){ //static are method which on our model 
  //while methods work on schema intance of that object
let User = this;
let decoded;
try{
decoded = jwt.verify(token,"123abc");
}catch(e){
  // return new Promise((resolve,reject)=>{
  //   reject();
  // })
  return Promise.reject()
}
console.log(decoded);
return User.findOne({
  "_id":decoded._id,
  "tokens.token":token,
  "tokens.access":"auth"
})
}

let User = mongoose.model('User',UserSchema);

module.exports = {User}
