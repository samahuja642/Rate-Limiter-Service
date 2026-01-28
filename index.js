const express = require("express");
const { rateLimiter } = require("./rateLimiter");
const { redisClient, connectRedis } = require('./utils/redisClient');

const app = express();

app.use(rateLimiter);

app.route('/test').get((req,res)=>{
    res.status(200).send("Test Hit Success");
});


const startApp = async() => {
    await connectRedis();
    app.listen(3000,()=>{
        console.log('App is successfully listening on PORT:3000');
    });
} 

startApp();