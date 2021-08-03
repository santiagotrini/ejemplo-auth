const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const app = express();

mongoose.connect('mongodb://localhost/auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('DB connected'));

app.set('view engine', 'pug');
app.set('views', './views');

// modelo para coleccion users
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', UserSchema);

// configuracion de passport
// configurar estrategia
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  (username, password, done) => {
    User
      .findOne({ username: username })
      .exec((err, user) => {
        if (!user) return done(null, false);
        if (password != user.password) return(null, false)
        return done(null, user)
      })
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) return done(err);
    done(null, user);
  });
});

// configurar sesiones
app.use(session({
  secret: 'holakse',
  resave: false,
  saveUninitialized: false
}));

// inicializar
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/secreto', (req, res) => {
  res.render('secreto', { user: req.user })
});

app.post('/login',
  passport.authenticate('local'),
  (req, res) => {
    res.redirect('/secreto');
  }
);

app.listen(3000);
