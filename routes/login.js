import { authenticate } from 'passport';

const router = require('express').Router();

router.get('/',(req,res)=>{
    //serve login form
    res.render('login', { errors: null })
})

router.post('/', (req, res, next) => {
    authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        //server side validations
        //in case client side is bypassed
        if (!user) {
            const message = info && info.message ? info.message : 'Login failed.';
            return res.status(401).render('login', {
                errors: [message]
            });
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            // console.log('received',user);

            return res.redirect('/');
        });
    })(req, res, next);
});

export default router;