import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); //

const dbName = "backend-project";
export const collectionName = "database";



const client = new MongoClient(process.env.MONGODBURI);

export const connection = async () => {
    const connect = await client.connect();
    return connect.db(dbName);
};
