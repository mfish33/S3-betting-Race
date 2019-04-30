let mongoose = require('mongoose');

// Article Schema
let articleSchema = mongoose.Schema({

  author:{
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  },
  bet:{

  },
  racers:{
    
  },
  maxnum:{
    
  }
});

let Article = module.exports = mongoose.model('Article', articleSchema);
