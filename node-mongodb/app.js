var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('./public/libs/underscore/underscore-min');
var Movie = require('./models/movie');
var User = require('./models/user');
var port = process.env.PORT || 3000;
var app = express();

mongoose.connect('mongodb://localhost/imooc');

app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');
app.listen(port);

// index route
app.get('/', function(req, res) {
    Movie.fetch(function(err, movies) {
        if (err) {
            console.log(err);
        }

        res.render('index', {
            title: 'imooc首页',
            movies: movies
        });
    });
});

// signup
app.post('/user/signup', function(req, res) {
    var _user = req.body.user;

    User.findOne({ name: _user.name }, function(err, user) {
        if (err) {
            console.log(err);
        }

        if (user) {
            return res.redirect('/');
        } else {
            var newUser = new User(_user);

            newUser.save(function(err, user) {
                if (err) {
                    console.log(err);
                }

                res.redirect('/admin/userlist');
            });
        }
    });

    // 根据路由的不同来获取数据的方式
    // req.param('user')

    // /user/signup/:userid
    // var _userid = req.params.userid;

    // /user/signup/111?userid=1112
});

// userlist route
app.get('/admin/userlist', function(req, res) {
    User.fetch(function(err, users) {
        if (err) {
            console.log(err);
        }

        res.render('userlist', {
            title: 'user列表页',
            users: users
        });
    });
});

// signin
app.post('/user/signin', function(req, res) {
    var _user = req.body.user;
    var name = _user.name;
    var pwd = _user.password;

    User.findOne({ name: name }, function(err, user) {
        if (err) {
            console.log(err);
        }

        if (!user) {
            return res.redirect('/');
        }

        if (pwd === user.password) {
            console.log("Login successfully.");
            return res.redirect('/');
        } else {
            console.log("Password is not correct.");
        }
    });

});

// detail route
app.get('/movie/:id', function(req, res) {
    var id = req.params.id;

    Movie.findById(id, function(err, movie) {
        if (err) {
            console.log(err);
        }

        res.render('detail', {
            title: 'imooc ' + movie.title,
            movie: movie
        });
    });
});

// admin update movie
app.get('/admin/update/:id', function(req, res) {
    var id = req.params.id;

    if (id) {
        Movie.findById(id, function(err, movie) {
            res.render('admin', {
                title: 'imooc 后台更新页',
                movie: movie
            });
        });
    }
});

// admin post movie
app.post('/admin/movie/new', function(req, res) {
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;

    // update
    if (id !== 'undefined') {
        Movie.findById(function(err, movie) {
            if (err) {
                console.log(err);
            }

            _movie = _.extend(movie, movieObj);

            _movie.save(function(err, movie) {
                if (err) {
                    console.log(err);
                }

                res.redirect('/movie/' + movie._id);
            });
        });
    } else {
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });

        _movie.save(function(err, movie) {
            if (err) {
                console.log(err);
            }

            res.redirect('/movie/' + movie._id);
        });
    }
});

// admin route
app.get('/admin/movie', function(req, res) {
    res.render('admin', {
        title: 'iMovie 后台管理',
        movie: {
            title: ' ',
            doctor: ' ',
            country: ' ',
            year: ' ',
            language: ' ',
            summary: ' ',
            poster: ' ',
            flash: ' '
        }
    });
});

// list route
app.get('/admin/list', function(req, res) {
    Movie.fetch(function(err, movies) {
        if (err) {
            console.log(err);
        }

        res.render('list', {
            title: 'imooc列表页',
            movies: movies
        });
    });
});

// list delete movie
app.delete('/admin/list', function(req, res) {
    var id = req.query.id;

    if (id) {
        Movie.remove({ _id: id }, function(err, movie) {
            if (err) {
                console.log(err);
            } else {
                res.json({ success: 1 });
            }
        });
    }
});