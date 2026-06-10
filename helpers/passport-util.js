import { serializeUser, deserializeUser } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { compare } from 'bcryptjs';
import { findUserByUsername } from '../store/queries';

function initialize(passport) {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const sanitizedUsername = username?.trim();
                const user = await findUserByUsername(sanitizedUsername);
                if (!user) {
                    return done(null, false, { message: "Incorrect username" });
                }
                
                const match = await compare(password, user.password);
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

serializeUser((user, done) => {
    done(null, user.username);
});

deserializeUser(async (username, done) => {
    try {
        const user = await findUserByUsername(username);
        done(null, user);
    } catch (error) {   
        done(error);
    }
});

export default initialize;
