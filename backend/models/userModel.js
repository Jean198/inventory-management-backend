const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    rquired: [true, "Please add a name"],
  },

  email: {
    type: String,
    rquired: [true, "Please add a name"],
    unique: true,
    trim: true, //Remove spaces
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minLength: [6, "Password must be minimum six characters"],
    maxLength: [23, "Password must not exceed 23 characters"],
  },
  photo: {
    type: String,
    required: [true, "Please add a photo"],
    default: "https://i.ibb.co/4pDNDk1/avatar.png",
  },
  phone: {
    type: String,
    default: "+358",
  },
  bio: {
    type: String,
    maxLength: [250, "Bio must not be more than 250 characters"],
    default: "bio",
  },
},
{
    timestamps:true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
