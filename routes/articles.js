const express = require('express');
const router = express.Router();

// Article Model
let Article = require('../models/article');
// User Model
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, function(req, res) {
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add Submit POST Route
router.post('/add', function(req, res) {
    var isnum = /^\d+$/.test(req.body.bet);
    req.body.bet = Math.floor(req.body.bet)
    if (isnum && req.body.bet >= 0 && parseInt(req.user.Money) - parseInt(req.body.bet) >= 0) {
        //req.checkBody('author','Author is required').notEmpty();
        req.checkBody('body', 'Body is required').notEmpty();
        // Get Errors
        let errors = req.validationErrors();
        if (errors) {
            res.render('add_article', {
                title: 'Add Article',
                errors: errors
            });
        } else {
            let article = new Article();
            article.author = req.user._id;
            article.body = req.body.body;
            article.bet = req.body.bet;
            article.racers = [req.user.username];
            article.maxnum=req.body.maxnum
            article.save(function(err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    let user = {};
                    user.username = req.user.username;
                    user.password = req.user.password;
                    user.Money = parseInt(req.user.Money) - parseInt(article.bet);
                    let query2 = {
                        _id: req.user._id
                    }
                    User.update(query2, user, function(err) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            req.flash('success', 'Listing Posted');
                            res.redirect('/');

                        }
                    });
                }
            });
        }
    } else {
        if (isnum && req.body.bet >= 0) req.flash('danger', 'insuficiant funds');
        else req.flash('danger', 'Bad value for Bet')
        res.redirect('/articles/add');
    }
});

router.get('/SendMoney', ensureAuthenticated, function(req, res) {
    res.render('SendMoney', {});
});
router.post('/SendMoney', function(req, res) {
  var isnum = /^\d+$/.test(req.body.amount);
  if(isnum){
    User.find({
        username: req.body.username
    }, function(err, user) {
        if (err) {
            console.log(err);
            return;
        }else if(user[0]) {
            user[0].Money = parseInt(req.body.amount) + parseInt(user[0].Money)
            let query = {
                _id: user[0]._id
            }
            User.update(query, user[0], function(err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Money Sent');
                    res.render('SendMoney', {});
                }
            });
        }else{
          req.flash('danger', 'Invalid Username');
          res.redirect('/articles/SendMoney');
        }
    });
  }else{
    req.flash('danger', 'Amount needs to be a number');
    res.redirect('/articles/SendMoney');
  }
});



// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Listing',
            article: article
        });
    });
});

// Update Submit POST Route
router.post('/edit/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        article.body = req.body.body;
        let query = {
            _id: req.params.id
        }
        Article.update(query, article, function(err) {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Listing Updated');
                res.redirect('/');
            }
        });
    });
});

// Delete Article
router.delete('/:id', function(req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = {
        _id: req.params.id
    }
    Article.findById(req.params.id, function(err, article) {
        if (req.user.username!='admin') {
            res.status(500).send();
        } else {
            var i
            for (i = 0; i < article.racers.length; i++) {
                User.find({
                    username: article.racers[i]
                }, function(err, user) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        user[0].Money = parseInt(user[0].Money) + parseInt(article.bet)
                        let query2 = {
                            _id: user[0]._id
                        }
                        User.update(query2, user[0], function(err) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {}
                        });
                    }
                });
            }
            Article.remove(query, function(err) {
                if (err) {
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });
});

// Get Single Article
router.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        User.findById(article.author, function(err, user) {
            res.render('article', {
                article: article,
                author: user.username
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}



router.get('/AddP/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (!article.racers.includes(req.user.username) && article.racers.length < article.maxnum) {
            article.racers.push(req.user.username)
            let query = {
                _id: req.params.id
            }
            Article.update(query, article, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
            let user = {};
            user.username = req.user.username;
            user.password = req.user.password;
            user.Money = parseInt(req.user.Money) - parseInt(article.bet);
            let query2 = {
                _id: req.user._id
            }
            User.update(query2, user, function(err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Race Joined');
                    res.redirect('/');

                }
            });
        } else if (article.racers.includes(req.user.username)) {
            req.flash('danger', 'Already Joined');
            res.redirect('/');
        } else {
            req.flash('danger', 'Race is full');
            res.redirect('/');
        }
    });
});

router.get('/win/:win/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (err) {
            console.log(err);
            return;
        } else {
            User.find({
                username: article.racers[req.params.win]
            }, function(err, user) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    user[0].Money = parseInt(user[0].Money) + parseInt(article.bet) * article.racers.length
                    let query = {
                        _id: user[0]._id
                    }
                    User.update(query, user[0], function(err) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            let query2 = {
                                _id: req.params.id
                            }
                            Article.remove(query2, function(err) {
                                if (err) {
                                    console.log(err);
                                }
                                res.redirect('/');
                            });
                        }
                    });
                }
            });
        }
    });
});




module.exports = router;