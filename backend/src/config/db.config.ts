import mongoose from "mongoose";
import { Env } from "./env";


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(Env.DB_URL);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;