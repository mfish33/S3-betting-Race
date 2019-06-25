const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

// Register Proccess
router.post('/register', function(req, res){

  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;


  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      username:username,
      password:password,
      Money:10
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success','You are now registered and can log in');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});


//Android register

router.post('/android/register', function(req, res){

  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;


  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    return res.json({  SERVER_MESSAGE: "Acount creation Failed" });
  } else {
    let newUser = new User({
      username:username,
      password:password,
      Money:10
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            return res.json({SERVER_MESSAGE: "Acount creation successfull" });
          }
        });
      });
    });
  }
});




// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Android Login
router.post('/android/login',
  passport.authenticate('local', { failWithError: true }),
  function(req, res, next) {
    // handle success
    return res.json(req.user);
  },
  function(err, req, res, next) {
    // handle error
    return res.json({  SERVER_MESSAGE: "Login Fail" });
  }
);

//Login
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

// Android logout
router.get('/android/logout', function(req, res){
  req.logout();
  return res.json({ SERVER_MESSAGE: "Loged out" });
});

module.exports = router;
