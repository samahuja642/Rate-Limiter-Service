const { createClient } = require("redis");

const client = createClient({
  url: "redis://localhost:6379/1",
});

client.on("error", (err) =>
  console.log("Redis Client Error", err)
);

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("Redis Client Connected");
  }
  return client;
}

module.exports = {
  redisClient: client,
  connectRedis,
};
