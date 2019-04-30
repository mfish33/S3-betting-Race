const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  Money:{
     type: String,
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
