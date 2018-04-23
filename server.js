var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movie');
var Review = require('./Review');
//
var cors = require('cors');

var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
//
app.use(cors());

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

    if (!req.body.imageUrl) {
            res.json({success: false, msg: 'Please pass ImageUrl.'});
        }

    if(req.body.Actors.length < 3) {
        res.json({success: false, msg: 'Please pass at least three actors.'})
    }
    else {

       var movie = new Movie();
       movie.Title = req.body.Title;
       movie.Year = req.body.Year;
       movie.Genre = req.body.Genre;
       movie.imageUrl = req.body.imageUrl;
       movie.Actors = req.body.Actors;

        movie.save(function(err) {
            if (err) {
                    return res.send(err);
            }
            res.json({ message: 'Movie created!' });
        });
    }
});

// router.route('/movies/Get')  // Get all
//     .get(authJwtController.isAuthenticated, function (req, res) {
//         Movie.find(function (err, movies) {
//             if (err) res.send(err);
//             // return the users
//             res.json(movies);
//         });
//     });

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
            if (req.body.imageUrl) {
                movie.imageUrl = req.body.imageUrl;
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
router.route('/review/write')  // save/create a new review
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.Movie) {
            res.json({success: false, msg: 'Please pass Movie name. '});
        }

        if (!req.body.Reviewer) {
            res.json({success: false, msg: 'Please pass Reviewer name.'});
        }

        if (!req.body.Review) {
            res.json({success: false, msg: 'Please pass the review.'});
        }

        if (!req.body.Rating) {
                res.json({success: false, msg: 'Please pass the rating.'});
        }


        else {
            Movie.findOne({Title: req.body.Movie}).select('Title').exec(function (err, result) {
                if (err) res.send(err);

                if(result) {
                    var review = new Review();
                    review.Movie = req.body.Movie;
                    review.Reviewer = req.body.Reviewer;
                    review.Review = req.body.Review;
                    review.Rating = req.body.Rating;

                    review.save(function (err) {
                        if (err) {
                            return res.send(err);
                        }
                        res.json({message: 'Review created!'});
                    });
                }
                else {
                    res.status(400);
                    res.json({message: 'Movie not found in Database. Cannot save review.'});
               }
            });
        }
});

router.get('/movies', function (req, res) {   //get reviews
        var id = req.params.movieId;
        if(req.query.reviews === 'true') {
            Movie.aggregate([{
                    $lookup:{ from: "reviews", localField: "Title", foreignField: "Movie", as: 'review'}
                }
            ], function (err, result) {
                if(err) res.send(err);
                else res.json(result);
            });
        }
        else {
            Movie.find(function (err, movies) {
                if (err) res.send(err);
                // return the users
                res.json(movies);
            });
        }
});

router.get('/review/getAll', function (req, res) {   //get reviews

        Review.find(function (err, reviews) {
            if (err) res.send(err);
            // return the reviews
            res.json(reviews);
        });
});


//db.events.aggregate([{ $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } }]).pretty();

//
app.use('/', router);
app.listen(process.env.PORT || 8080);
