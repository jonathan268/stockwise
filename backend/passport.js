const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./src/models/User");
const Organization = require("./src/models/Organization");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        // 1. Chercher si utilisateur existe déjà avec ce googleId
        let user = await User.findOne({ googleId });

        if (user) {
          // Utilisateur connu via Google → connexion directe
          return done(null, user);
        }

        // 2. Chercher si un compte existe déjà avec cet email (inscription classique)
        user = await User.findOne({ email });

        if (user) {
          // Lier le compte Google à l'account existant
          user.googleId = googleId;
          user.avatar = user.avatar || profile.photos?.[0]?.value;
          await user.save();
          return done(null, user);
        }

        // 3. Créer un nouvel utilisateur
        user = await User.create({
          googleId,
          email,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos?.[0]?.value,
          status: "active",
          // Pas de password pour les comptes Google
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// Pas de session — on utilise JWT
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;