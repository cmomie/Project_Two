require('dotenv').config(); //moves everything so that it's accesible in the code
const express = require('express');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const app = express();
const isLoggedIn = require('./middleware/isLoggedIn');
const methodOverride = require('method-override');
const secret = process.env.SECRET_SESSION
const db = require('./models');

// console.log(SECRET_SESSION);

app.set('view engine', 'ejs'); //set up view engine

app.use(require('morgan')('dev')); //tells the routes available on the server when restarted
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false })); //tells express to do url encoding to avoid having to parse queries
app.use(express.static(__dirname + '/public')); //setting up static route to deliver full routes from public files
app.use(layouts); //add layouts as view engine/middleware

app.use(flash());            // flash middleware (redbox that pops up for incorrect password)

app.use(session({     //node.js is able to save user info from isLogged even after logged out
  secret: secret,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

app.use(passport.initialize());      // Initialize passport
app.use(passport.session());         // Add a session

app.use((req, res, next) => { //set a custom funtion used with flash and appending
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

//order of app.use matter lets server know when to use them

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/profile', isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get(); 
  res.render('profile', { id, name, email });
});

app.delete('/profile/:id', isLoggedIn, (req, res) => {
  res.redirect('/');
});

app.get('/profile/edit', isLoggedIn, (req, res) => {
  res.render('edit');
});

app.put('/profile/:id', isLoggedIn, async (req, res) => {
  try {
      const foundUser = await db.user.findOne({ where: { email: req.body.email }});
      if (foundUser.email && foundUser.id !== req.user.id) {
        req.flash('error', 'Email already exists. Please try again.');
        res.redirect('/profile');
      } else {
        const usersUpdated = await db.user.update({
          email: req.body.email,
          name: req.body.name
        }, {
          where: {
            id: req.params.id
          }
        });

        console.log('********** PUT ROUTE *************');
        console.log('Users updated', usersUpdated);
        console.log('**************************************************');
  
        // redirect back to the profile page
        res.redirect('/profile'); // route
      }
  } catch (error) {
    console.log('*********************ERROR***********************');
    console.log(error);
    console.log('**************************************************');
    res.render('edit');
  }
});


app.use('/auth', require('./controllers/auth')); //additional controllers were added and it tell server whenever it see auth it will pass the rest to be processed 
app.use('/quotes', require('./controllers/quotes'));
const PORT = process.env.PORT || 3000; 
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
