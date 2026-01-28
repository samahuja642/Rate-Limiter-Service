const { redisClient } = require("./utils/redisClient");


const WINDOW = 60;
const LIMIT = 10;

const rateLimiter = async (req,res,next) => {
    try{
        if (!redisClient?.isOpen) {
            return next();
        }
        const key = `ip-${req.ip}`;
        try{
            const current = await redisClient.incr(key);
            const redisKey = await redisClient.get(key);
            if(current===1){
                await redisClient.expire(key,WINDOW);
            }
            if(current>LIMIT){
                return res.status(429).send("Too many requests");
            }
            next();
        }
        catch(err){
            console.log('Rate Limiter Bypassed.');
            next();
        }

    }catch(err){
        console.log("Rate Limitter Bypassed.");
        next();
    }
};

module.exports = {
    rateLimiter,
    rateLimiterWindow:WINDOW,
    rateLimiterLimit:LIMIT,
}