const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt= require('bcryptjs')
const db= require('../store/queries')

function initialize(passport) {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const sanitizedUsername = username?.trim();
                const user = await db.findUserByUsername(sanitizedUsername);
                if (!user) {
                    return done(null, false, { message: "Incorrect username" });
                }
                
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return done(null, false, { message: "Incorrect password" });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );
}

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
    try {
        const user = await db.findUserByUsername(username);
        done(null, user);
    } catch (error) {   
        done(error);
    }
});

module.exports = initialize;
