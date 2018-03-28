let {
    User
  } = require('.././models/user');
let authtication = (req,res,next)=>{
    let token = req.header("x-auth");
    console.log(`******************${token}**************`);
      User.findByToken(token).then((user)=>{
        if(!user){
          return Promise.reject()
        }
        req.user =user;
        req.token = token;
        next();
      }).catch((e)=>{
        res.status(401).send("Authtication is Required");
      })
  }
  module.exports={
      authtication
  }