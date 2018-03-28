const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
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
})

UserSchema.methods.generateAuthToken=function (){
let user = this;
let access =  "auth";
let token = jwt.sign({_id:user._id.toHexString(),access},"123abc").toString();
user.tokens.push({access,token}); // to order all server js to chain it we return
return user.save().then(() =>{
  return token;
});
};

let User = mongoose.model('User',UserSchema);

module.exports = {User}
