const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let server;

const startDb = async () => {
  server = await MongoMemoryServer.create(); // binds to 127.0.0.1
  await mongoose.connect(server.getUri());
};

const clearDb = async () => {
  for (const c of Object.values(mongoose.connection.collections)) await c.deleteMany({});
};

const stopDb = async () => {
  await mongoose.disconnect();
  if (server) await server.stop();
};

module.exports = { startDb, clearDb, stopDb };
