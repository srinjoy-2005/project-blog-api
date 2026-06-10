import express from 'express';
import 'dotenv/config'
//contains nested comments route
import postRouter from './routes/posts'


const app = express()
const PORT = process.env.port || 6969


//routes
app.get('/',(req,res)=>{
    res.sendFile('./views/apiHelp.js')
})

app.use('/posts',postRouter);

//404
app.all('{*splat}',(req,res)=>{
    res.status(404).json({ error: 'Route not found' });
})

//error handler for server/db errors
app.use((err, req, res, next) => {
    console.error(err);
    res.status(404).json({ error: 'Server error' });
});

app.listen(PORT,(err)=>{
    if (err){
        throw err;
    }
    console.log(`App listening on port localhost:${PORT}`);
})
