import express from 'express';
import 'dotenv/config'
//contains nested comments route
import postRouter from './routes/posts.js'
import path from 'path'
import signupRouter from './routes/sign-up.js'
import loginRouter from './routes/login.js'
import { sign } from 'crypto';

const app = express()
const PORT = process.env.PORT || 6969

//body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//routes
app.get('/',(req,res)=>{
    res.sendFile(path.resolve('./views/apiHelp.html'))
})

app.use('/signup', signupRouter);
app.use('/login', loginRouter);

app.use('/posts',postRouter);

//404
app.all('{*splat}',(req,res)=>{
    res.status(404).json({ error: 'Route not found' });
})

//error handler for server/db errors
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err });
});

app.listen(PORT,(err)=>{
    if (err){
        throw err;
    }
    console.log(`App listening on port localhost:${PORT}`);
})
