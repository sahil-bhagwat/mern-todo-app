import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); //

const dbName = "mynewdb";
export const collectionName = "todo";



const client = new MongoClient(process.env.MONGODBURI);

export const connection = async () => {
    const connect = await client.connect();
    return connect.db(dbName);
};
