import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

async function startEmbeddedMongo() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const dbPath = path.resolve('data/mongo');
  fs.mkdirSync(dbPath, { recursive: true });

  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'shabab',
        dbPath,
        storageEngine: 'wiredTiger',
      },
    });
    await mongoose.connect(mongod.getUri('shabab'));
    console.log('Embedded MongoDB is running. Data is stored in backend/data/mongo');
    return;
  } catch (error) {
    console.log('Could not reuse the saved database folder. Starting a fresh embedded database.');
    console.log(error.message);
  }

  const mongod = await MongoMemoryServer.create({
    instance: { dbName: 'shabab' },
  });
  await mongoose.connect(mongod.getUri('shabab'));
  console.log('Embedded MongoDB is running in memory. Install MongoDB or keep this process open to retain data.');
}

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shabab';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('MongoDB connected:', uri);
    return;
  } catch {
    console.log(`No MongoDB server found at ${uri}.`);
    await mongoose.disconnect().catch(() => {});
  }

  await startEmbeddedMongo();
}
