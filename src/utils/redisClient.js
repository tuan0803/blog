const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

let connectionStatus = 'disconnected';

const handleConnect = (status) => {
    connectionStatus = status;
    console.log(`Redis connection status: ${status}`);
};


redisClient.on('connect', () => handleConnect('connected'));
redisClient.on('error', (err) => {
    console.error('Redis Connection Error', err);
    handleConnect('error');
});
redisClient.on('reconnecting', () => handleConnect('reconnecting'));
redisClient.on('end', () => handleConnect('disconnected'));

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Could not connect to Redis', err);
        handleConnect('error');
    }
})();



module.exports = redisClient;