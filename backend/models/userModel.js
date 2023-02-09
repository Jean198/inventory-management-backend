const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      rquired: [true, 'Please add a name'],
    },

    email: {
      type: String,
      rquired: [true, 'Please add a name'],
      unique: true,
      trim: true, //Remove spaces
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minLength: [6, 'Password must be minimum six characters'],
      //maxLength: [100, 'Password must not exceed 100 characters'],
      trim: true,
    },
    photo: {
      type: String,
      required: [true, 'Please add a photo'],
      default: 'https://i.ibb.co/4pDNDk1/avatar.png',
    },
    phone: {
      type: String,
      default: '+358',
    },
    bio: {
      type: String,
      maxLength: [250, 'Bio must not be more than 250 characters'],
      default: 'bio',
    },
  },
  {
    timestamps: true,
  }
);

//Encrypt password before saving it
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  //Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
