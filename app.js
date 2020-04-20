const express = require('express')
const app = express()
const port = 3000


var session = require('express-session');

var appsecret = process.argv.slice(2);
console.log( "appsecret = " + appsecret );

// config express-session
var sess = {
  secret: appsecret,
  cookie: {},
  resave: false,
  saveUninitialized: true
};

// Load environment variables from .env
var dotenv = require('dotenv');
dotenv.config();

// Load Passport
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    consumerKey: process.env.GOOGLE_CONSUMER_KEY,
    consumerSecret: process.env.GOOGLE_CONSUMER_SECRET,
    callbackURL: "http://localhost:3000/callback"
  },
  function(token, tokenSecret, profile, done) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
  }
));

passport.use(GoogleStrategy);




// code from https://www.npmjs.com/package/openid-client

const { Issuer } = require('openid-client');
 Issuer.discover('https://accounts.google.com') // => Promise
  .then(function (googleIssuer) {
//    console.log('Discovered issuer %s %O', googleIssuer.issuer, googleIssuer.metadata);


  const client = new googleIssuer.Client({
  client_id: 'xxx',
  client_secret: 'yyy',
  redirect_uris: ['http://localhost:3000'],
  response_types: ['code'],
  // id_token_signed_response_alg (default "RS256")
	  // token_endpoint_auth_method (default "client_secret_basic")
	}); // => Client

});

// https://console.developers.google.com/apis/credentials/oauthclient
// http://www.passportjs.org/docs/google/


//app.get('/', (req, res) => res.send('Hello World!'))

app.use(express.static("public"));
app.set("view engine", "ejs");

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authorization, Google will redirect the user
//   back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get("/",function(req,res){
  res.render("home");
});

app.listen(port, () => console.log('Example app listening on port ' + port + ' !'))
