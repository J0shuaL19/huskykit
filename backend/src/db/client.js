const { MongoClient } = require('mongodb');

let client;

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  client = new MongoClient(uri);
  await client.connect();
  return client.db(process.env.MONGODB_DB || 'huskykit');
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
  }
}

module.exports = { connectDatabase, closeDatabase };
