/**
 * Module dependencies.
 */
const express = require('express');
const requestProxy = require('express-request-proxy');
const redis = require("redis"); 
require("redis-streams")(redis);

const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({
  dest: path.join(__dirname, 'uploads')
});

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({
  path: process.env.USE_ENV || '.env.dev'
});


/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const playlistsController = require('./controllers/playlists');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
const sess = {
  resave: true,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1209600000
  }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
};
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    // lusca.csrf()(req, res, next);
    next();
  }
});
// pp.use(lusca.xframe('SAMEORIGIN'));
// app.use(lusca.xssProtection(true));
app.disable('x-powered-by');



app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
const apps = {
  'app1': 'https://apphub-microapp-seed.run.aws-usw02-pr.ice.predix.io/'
};
/* TODO - Proxy to App Example */
app.all("/apps/:app?", function middleware(req, res, next){
  console.log('proxy request', req.params, req.session);
  if(req.params.app){
    const url = apps[req.params.app];
    
    if(url){
      req.session.appUrl = url;
      req.appUrl = url;
      req.session.save();
      next();
    }
  } else {
    next();
  }
  
}, (req, res, next) => {
  const {appUrl} = req.session;
  const p = requestProxy({
    cache: redis.createClient(),
    cacheMaxAge: 60,
    url: `${appUrl}/*`,
    query: {
      secret_key: process.env.SOMEAPI_SECRET_KEY
    },
    headers: {
      "X-Custom-Header": process.env.SOMEAPI_CUSTOM_HEADER
    }
  });
  
  p(req, res, next);
});

/*  TODO - Proxy DB Example */ 

app.all("/api/db/:resource?/:id?",
  requestProxy({
    cache: redis.createClient(),
    cacheMaxAge: 60,
    url: "https://apphub-microapp-seed.run.aws-usw02-pr.ice.predix.io/api/db/:resource?/:id?",
    query: {
      secret_key: process.env.SOMEAPI_SECRET_KEY
    },
    headers: {
      "X-Custom-Header": process.env.SOMEAPI_CUSTOM_HEADER
    }
  }));




app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user &&
    (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

/** Proxy */



app.use('/', express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
  maxAge: 31557600000
}));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), {
  maxAge: 31557600000
}));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), {
  maxAge: 31557600000
}));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account/verify', passportConfig.isAuthenticated, userController.getVerifyEmail);
app.get('/account/verify/:token', passportConfig.isAuthenticated, userController.getVerifyEmailToken);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

const playlistRouter = express.Router();
playlistRouter.use(bodyParser.json());
playlistRouter.all('/playlists', function(req, res, next){
  console.log('playlists', req.url);
  next(); 
});
playlistRouter.get('/playlists/:id?', playlistsController.get);
playlistRouter.put('/playlists/:id', bodyParser.json(), playlistsController.put);
playlistRouter.delete('/playlists/:id', playlistsController.delete);
playlistRouter.post('/playlists', bodyParser.json(), playlistsController.post);

app.use(playlistRouter);


/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);

/*


app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get('/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/lob', apiController.getLob);
*/

app.get('/api/upload', lusca({
  csrf: true
}), apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), lusca({
  csrf: true
}), apiController.postFileUpload);

/*
app.get('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.post('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
app.get('/api/here-maps', apiController.getHereMaps);
app.get('/api/google-maps', apiController.getGoogleMaps);
app.get('/api/google/drive', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleDrive);
app.get('/api/chart', apiController.getChart);
app.get('/api/google/sheets', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleSheets);
app.get('/api/quickbooks', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getQuickbooks);
*/
if(process.env.GITHUB_ID){
  app.get('/auth/github', passport.authenticate('github'));
  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/login'
  }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
  });
}

if(process.env.SPOTIFY_ID){
  app.get('/auth/spotify', passport.authenticate('spotify'));
  app.get('/auth/spotify/callback', passport.authenticate('spotify', {
    failureRedirect: '/login'
  }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
  });
}

/**
 * OAuth authentication routes. (Sign in)
 *
app.get('/auth/instagram', passport.authenticate('instagram', {
  scope: ['basic', 'public_content']
}));
app.get('/auth/instagram/callback', passport.authenticate('instagram', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/snapchat', passport.authenticate('snapchat'));
app.get('/auth/snapchat/callback', passport.authenticate('snapchat', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
  accessType: 'offline',
  prompt: 'consent'
}));
app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', {
  state: 'SOME STATE'
}));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});


 * OAuth authorization routes. (API examples)
 
app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', {
  failureRedirect: '/api'
}), (req, res) => {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', {
  failureRedirect: '/api'
}), (req, res) => {
  res.redirect('/api/tumblr');
});
app.get('/auth/steam', passport.authorize('openid', {
  state: 'SOME STATE'
}));
app.get('/auth/steam/callback', passport.authorize('openid', {
  failureRedirect: '/api'
}), (req, res) => {
  res.redirect(req.session.returnTo);
});
app.get('/auth/pinterest', passport.authorize('pinterest', {
  scope: 'read_public write_public'
}));
app.get('/auth/pinterest/callback', passport.authorize('pinterest', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/api/pinterest');
});
app.get('/auth/quickbooks', passport.authorize('quickbooks', {
  scope: ['com.intuit.quickbooks.accounting'],
  state: 'SOME STATE'
}));
app.get('/auth/quickbooks/callback', passport.authorize('quickbooks', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect(req.session.returnTo);
});
*/

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  console.log(process.env);
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

require('./middleware/graphql')(app);


const getSpotifyToken = (user) => {
  const t = user.tokens.filter(token => token.kind === 'spotify');

  console.log('getSpotifyToken', t);
  return t ? t[0]: null;
};

/*
Spotify API Example 
Example
 http://localhost:8080/api/spotify?q=deadmau5&type=album,track&limit=2
*/
app.get('/api/spotify?', passportConfig.isAuthenticated, (req, res, next) => {
  const proxy = requestProxy({
    url: "https://api.spotify.com/v1",
    query: req.query,
    headers: {
      "Authorization": `Bearer ${getSpotifyToken(req.user).accessToken}`
    }
  });
  proxy(req, res, next);
});
app.get('/api/spotify/:resource?', passportConfig.isAuthenticated, (req, res, next) => {
  const proxy = requestProxy({
    url: "https://api.spotify.com/v1/:resource",
    query: req.query,
    headers: {
      "Authorization": `Bearer ${getSpotifyToken(req.user).accessToken}`
    }
  });
  proxy(req, res, next);
});

/*
app.get('/api/spotify/search?', passportConfig.isAuthenticated, (req, res, next) => {
  const proxy = requestProxy({
    url: "https://api.spotify.com/v1/search",
    query: req.query,
    headers: {
      "Authorization": `Bearer ${getSpotifyToken(req.user).accessToken}`
    }
  });
  proxy(req, res, next);
});

app.get('/api/spotify/browse/:resource', passportConfig.isAuthenticated, (req, res, next) => {
  const proxy = requestProxy({
    url: "https://api.spotify.com/v1/browse/:resource",
    query: req.query,
    headers: {
      "Authorization": `Bearer ${getSpotifyToken(req.user).accessToken}`
    }
  });
  proxy(req, res, next);
});
*/
app.get([
  '/api/spotify/:resource/:id?/:sub?'
], passportConfig.isAuthenticated, (req, res, next) => {
  const proxy = requestProxy({
    url: "https://api.spotify.com/v1/:resource/:id/:sub",
    query: req.query,
    headers: {
      "Authorization": `Bearer ${getSpotifyToken(req.user).accessToken}`
    }
  });
  proxy(req, res, next);
});


app.get('/me', passportConfig.isAuthenticated, (req, res) => {
  console.log(req.user);
  res.send(req.session);
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;