var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movie');
var Review = require('./Review');

var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});

////
router.route('/movies/Create')  // save/create a new movie
    .post(authJwtController.isAuthenticated, function (req, res) {
//router.post('/create', function(req, res) {
    if (!req.body.Title) {
        res.json({success: false, msg: 'Please pass Title'});
    }

    if (!req.body.Year) {
        res.json({success: false, msg: 'Please pass Year.'});
    }

    if (!req.body.Genre) {
        res.json({success: false, msg: 'Please pass Genre.'});
    }

    if(req.body.Actors.length < 3) {
        res.json({success: false, msg: 'Please pass at least three actors.'})
    }
    else {
//     var Actor = req.body.Actors;
       var movie = new Movie();
       movie.Title = req.body.Title;
       movie.Year = req.body.Year;
       movie.Genre = req.body.Genre;
       movie.Actors = req.body.Actors;
//       movie.content.push(Actor);
//       movie.Actors.ActorName = req.body.Actors.ActorName;
//       movie.Actors.CharacterName = req.body.Actors.CharacterName;
//       movie.Actors.fill(req.body.Actors.ActorName, 0, 0);
//       movie.Actors.fill(req.body.Actors.CharacterName, 1, 1);
        // save the movie
        movie.save(function(err) {
            if (err) {
                    return res.send(err);
            }
            res.json({ message: 'Movie created!' });
        });
    }
});

router.route('/movies/Get')  // Get all
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            // return the users
            res.json(movies);
        });
    });

router.route('/movies/Get/:movieId') // Get by Id
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

            var movieJson = JSON.stringify(movie);
            // return that movie
            res.json(movie);
        });
    });

router.route('/movies/Delete/:movieId') // Delete by Id
    .delete(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

           // var movieJson = JSON.stringify(movie);
            movie.remove();
            // return that movie
            res.json({ message: 'The movie you specified has been deleted.' });
        });
    });

router.route('/movies/Update/:movieId') // Update by Id
    .put(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

            // var movieJson = JSON.stringify(movie);
            if (req.body.Title) {
                movie.Title = req.body.Title;
            }
            if (req.body.Year) {
                movie.Year = req.body.Year;
            }
            if (req.body.Genre) {
                movie.Genre = req.body.Genre;
            }
            if (req.body.Actors) {
                movie.Actors = req.body.Actors;
            }

            movie.save(function(err) {
                if (err) {
                    return res.send(err);
                }
                res.json({ message: 'The movie you specified has been updated.' });
            });
        });
    });
////


// Reviews
router.route('/review')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Review.find(function (err, reviews) {
            if (err) res.send(err);
            // return the users
            res.json(reviews);
        });
});

//
app.use('/', router);
app.listen(process.env.PORT || 8080);
