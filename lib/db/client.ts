import { MongoClient, type Db } from "mongodb";
import { databaseName, mongoUri } from "@/lib/env";

type GlobalMongo = typeof globalThis & {
  _jcaMongoClient?: Promise<MongoClient>;
};

const globalMongo = globalThis as GlobalMongo;

export function getMongoClient(): Promise<MongoClient> {
  if (!globalMongo._jcaMongoClient) {
    const client = new MongoClient(mongoUri(), {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10_000,
    });
    globalMongo._jcaMongoClient = client.connect();
  }
  return globalMongo._jcaMongoClient;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(databaseName());
}
