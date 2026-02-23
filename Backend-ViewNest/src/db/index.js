import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const db_Connect = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log('Connection established');
    } catch (error) {
        console.log('Error while establishing connection', error)
        process.exit(1);
    }
}

export default db_Connect