/*  EXPRESS SETUP  */

// create express app 
const express = require('express');
const app = express();

app.use(express.static(__dirname)); // directory to serve static files

// Middleware: body-parser
const bodyParser = require('body-parser');
const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));

/*  PASSPORT SETUP  */

const passport = require('passport');
// Middleware: Session Authentication 
app.use(passport.initialize());
app.use(passport.session());

/* MONGOOSE SETUP */

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/MyDatabase',
  { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

/* PASSPORT LOCAL AUTHENTICATION */
/* check check */
passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser()); // will be invoked on authentication, job is to serialize user instance with information we pass on to it and store it in the session via a cookie
passport.deserializeUser(UserDetails.deserializeUser()); // provide unique cookie identifier as a “credential”
/* stop check ^ */

/* ROUTES */

const connectEnsureLogin = require('connect-ensure-login');

/*
If authentication fails, it will redirect us to /login, 
but it will add a query parameter — info — that will contain 
an error message. Otherwise, if authentication is successful, 
it will redirect us to the '/' route.
*/
app.post('/login', (req, res, next) => {
  passport.authenticate('local',
  (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/login?info=' + info);
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      return res.redirect('/');
    });

  })(req, res, next);
});

app.get('/login',
  (req, res) => res.sendFile('html/login.html',
  { root: __dirname })
);

app.get('/',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.sendFile('html/index.html', {root: __dirname})
);

app.get('/private',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.sendFile('html/private.html', {root: __dirname})
);

app.get('/user',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);