const express = require('express')
const router = express.Router()
const bcrypt=require('bcryptjs')
const {validateSignupData : validateSignup} = require('../helpers/sign-up-validation')
const { findUserByUsername, createUser } = require('../store/queries')

const salt=10;

async function generateHash(password,salt=10) {
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log('hashed',hashedPassword); 
    return hashedPassword;
}

router.get('/',(req,res)=>{
    res.render('sign-up',{errors:null}) //define errors as null for first time 
})

router.post('/',async (req,res)=>{
    try{
        const body = req.body;
        // console.log(body);

        //Validation
        //validation in helpers/validation
        const {isValid,dbData,errors}=validateSignup(body);

        if (!isValid) {
            // Render the page again with error messages
            return res.render('sign-up', { 
                errors
            });
        }

        const existingUser = await findUserByUsername(dbData.username);

        if (existingUser) {
            return res.render('sign-up', {
                errors: ['Username already exists. Please choose another one.']
            });
        }

        const hashedPassword = await generateHash(dbData.rawPassword, salt);

        await createUser({
            username: dbData.username,
            fullName: dbData.fullname,
            hashedPassword,
            membership: dbData.membership
        });

        res.redirect('/')
    }catch(error){
        //race conditions some shii with postgres
        if (error && error.code === '23505') {
            return res.render('sign-up', {
                errors: ['Username already exists. Please choose another one.']
            });
        }

        console.log(error);
        
        res.status(500).send("Internal Server Error");
    }
})

module.exports=router;
