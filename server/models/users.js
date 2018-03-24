let mongoose = require("mongoose");

let User = mongoose.model("Users", {
    name: {
      type: "String"
    },
    email: {
      type: "String",
      required: true,
      trim: true,
      minlenght: 1
    }
  });
  module.exports ={
      User
}