require('dotenv').config(); 
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

app.set('view engine', 'ejs'); 

app.use(require('morgan')('dev')); 
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false })); 
app.use(express.static(__dirname + '/public')); 
app.use(layouts);
app.use(flash());            // flash middleware (redbox that pops up for incorrect password)

app.use(session({     //node.js is able to save user info from isLogged even after logged out
  secret: secret,    
  resave: false,             
  saveUninitialized: true    
}));

app.use(passport.initialize());      // Initialize passport
app.use(passport.session());         // Add a session

app.use((req, res, next) => { 
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

app.use('/auth', require('./controllers/auth')); 
app.use('/quotes', require('./controllers/quotes'));


app.get('*', (req, res) => {
  res.render('404');
})

const PORT = process.env.PORT || 3000; 
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
