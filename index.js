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